package com.smartledger.service;

import com.smartledger.domain.*;
import com.smartledger.dto.DepletionForecast;
import com.smartledger.dto.MacroSpendSummaryDto;
import com.smartledger.dto.SubMeterShareResult;
import com.smartledger.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class DashboardSummaryService {

    private final ElectricityRecordRepository electricityRepo;
    private final GasRecordRepository gasRepo;
    private final TelecomRecordRepository telecomRepo;
    private final TransportRecordRepository transportRepo;
    private final GroceryRecordRepository groceryRepo;
    private final UserRepository userRepo;
    private final GasDepletionEngine gasEngine;
    private final ElectricityCalculationEngine electricityEngine;

    public DashboardSummaryService(ElectricityRecordRepository electricityRepo,
                                  GasRecordRepository gasRepo,
                                  TelecomRecordRepository telecomRepo,
                                  TransportRecordRepository transportRepo,
                                  GroceryRecordRepository groceryRepo,
                                  UserRepository userRepo,
                                  GasDepletionEngine gasEngine,
                                  ElectricityCalculationEngine electricityEngine) {
        this.electricityRepo = electricityRepo;
        this.gasRepo = gasRepo;
        this.telecomRepo = telecomRepo;
        this.transportRepo = transportRepo;
        this.groceryRepo = groceryRepo;
        this.userRepo = userRepo;
        this.gasEngine = gasEngine;
        this.electricityEngine = electricityEngine;
    }

    public User getDefaultDemoUser() {
        return userRepo.findByEmail("demo@smartledger.local")
                .or(() -> userRepo.findByEmail("rithick@smartledger.local"))
                .or(() -> userRepo.findAll().stream().findFirst())
                .orElse(null);
    }

    public User getUserByEmail(String email) {
        if (email == null || email.isBlank()) return null;
        return userRepo.findByEmail(email).orElse(null);
    }

    public MacroSpendSummaryDto getMacroBreakdown(User user) {
        List<ElectricityRecord> elecs = electricityRepo.findByUserOrderByBillingMonthDesc(user);
        double elecSpend = elecs.isEmpty() ? 0.0 : elecs.get(0).getCalculatedMyShare();

        List<GasRecord> gases = gasRepo.findByUserOrderByConnectedDateDesc(user);
        double gasSpend = gases.isEmpty() ? 0.0 : gases.get(0).getBookingCost();

        double telecomSpend = telecomRepo.findByUserOrderByExpiryDateAsc(user).stream()
                .mapToDouble(TelecomRecord::getPlanAmount).sum();

        double transportSpend = transportRepo.findByUserOrderByEntryDateDesc(user).stream()
                .mapToDouble(TransportRecord::getTotalFareCost).sum();

        double grocerySpend = groceryRepo.findByUserOrderByPurchaseDateDesc(user).stream()
                .mapToDouble(GroceryRecord::getTotalAmount).sum();

        double total = elecSpend + gasSpend + telecomSpend + transportSpend + grocerySpend;

        Map<String, Double> dist = new HashMap<>();
        if (total > 0) {
            dist.put("Electricity", Math.round((elecSpend / total) * 1000.0) / 10.0);
            dist.put("Gas", Math.round((gasSpend / total) * 1000.0) / 10.0);
            dist.put("Telecom", Math.round((telecomSpend / total) * 1000.0) / 10.0);
            dist.put("Transport", Math.round((transportSpend / total) * 1000.0) / 10.0);
            dist.put("Grocery", Math.round((grocerySpend / total) * 1000.0) / 10.0);
        }

        return new MacroSpendSummaryDto(elecSpend, gasSpend, telecomSpend, transportSpend, grocerySpend, total, dist);
    }

    public Map<String, Object> getDetailedOverview(User user) {
        Map<String, Object> overview = new HashMap<>();

        // 1. Macro Summary
        overview.put("macro", getMacroBreakdown(user));

        // 2. User Info
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getUserId());
        userInfo.put("fullName", user.getFullName());
        userInfo.put("email", user.getEmail());
        overview.put("user", userInfo);

        // 3. Electricity Details
        List<ElectricityRecord> elecs = electricityRepo.findByUserOrderByBillingMonthDesc(user);
        Map<String, Object> elecData = new HashMap<>();
        if (!elecs.isEmpty()) {
            elecData.put("latest", elecs.get(0));
        }
        elecData.put("history", elecs);
        overview.put("electricity", elecData);

        // 4. Gas Details & Thermodynamic Depletion
        List<GasRecord> gases = gasRepo.findByUserOrderByConnectedDateDesc(user);
        Map<String, Object> gasData = new HashMap<>();
        if (!gases.isEmpty()) {
            GasRecord active = gases.get(0);
            DepletionForecast forecast = gasEngine.calculateForecast(active, gases, LocalDate.now());
            gasData.put("active", active);
            gasData.put("forecast", forecast);
        }
        gasData.put("history", gases);
        overview.put("gas", gasData);

        // 5. Telecom Details & Expiry Matrix
        List<TelecomRecord> telecoms = telecomRepo.findByUserOrderByExpiryDateAsc(user);
        Map<String, Object> telecomData = new HashMap<>();
        telecomData.put("records", telecoms);
        long expiringSoon = telecoms.stream().filter(r -> {
            long days = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), r.getExpiryDate());
            return days >= 0 && days <= 5;
        }).count();
        long expired = telecoms.stream().filter(r -> r.getExpiryDate().isBefore(LocalDate.now())).count();
        telecomData.put("expiringSoonCount", expiringSoon);
        telecomData.put("expiredCount", expired);
        overview.put("telecom", telecomData);

        // 6. Transport Details
        List<TransportRecord> transports = transportRepo.findByUserOrderByEntryDateDesc(user);
        Map<String, Object> transportData = new HashMap<>();
        transportData.put("records", transports);
        double totalTransportSpend = transports.stream().mapToDouble(TransportRecord::getTotalFareCost).sum();
        transportData.put("totalMonthlySpend", totalTransportSpend);
        overview.put("transport", transportData);

        // 7. Grocery Details
        List<GroceryRecord> groceries = groceryRepo.findByUserOrderByPurchaseDateDesc(user);
        Map<String, Object> groceryData = new HashMap<>();
        groceryData.put("records", groceries);
        double totalGrocerySpend = groceries.stream().mapToDouble(GroceryRecord::getTotalAmount).sum();
        groceryData.put("totalMonthlySpend", totalGrocerySpend);
        overview.put("grocery", groceryData);

        return overview;
    }

    public SubMeterShareResult simulateElectricity(double masterUnits, double myUnits, double otherUnits) {
        return electricityEngine.calculateShare(masterUnits, myUnits, otherUnits);
    }

    @Transactional
    public void addSimulatedExpense(User user) {
        if (user == null) {
            user = getDefaultDemoUser();
        }
        if (user != null) {
            groceryRepo.save(new GroceryRecord(user, "Supermart Provisions (Test Entry)", GroceryCategory.ESSENTIAL_STAPLE, 750.0, LocalDate.now(), "Simulated Test Receipt - Click Reset to restore baseline"));
        }
    }

    @Transactional
    public void clearAllData() {
        electricityRepo.deleteAll();
        gasRepo.deleteAll();
        telecomRepo.deleteAll();
        transportRepo.deleteAll();
        groceryRepo.deleteAll();
    }

    @Transactional
    public void resetData() {
        clearAllData();
    }

    @Transactional
    public GasRecord connectGas(User user, double weightKg, double bookingCost, LocalDate connectedDate) {
        if (user == null) user = getDefaultDemoUser();
        if (user == null) return null;

        gasRepo.findByUserAndIsActiveTrue(user).ifPresent(curr -> {
            curr.setIsActive(false);
            curr.setFinishedDate(connectedDate != null ? connectedDate : LocalDate.now());
            curr.validateRecord();
            gasRepo.save(curr);
        });

        GasRecord newCylinder = new GasRecord(user, weightKg, bookingCost, connectedDate != null ? connectedDate : LocalDate.now(), null, true);
        newCylinder.validateRecord();
        return gasRepo.save(newCylinder);
    }

    @Transactional
    public GasRecord finishGas(User user, LocalDate finishedDate) {
        if (user == null) user = getDefaultDemoUser();
        if (user == null) return null;

        return gasRepo.findByUserAndIsActiveTrue(user).map(curr -> {
            curr.setIsActive(false);
            LocalDate fin = finishedDate != null ? finishedDate : LocalDate.now();
            curr.setFinishedDate(fin);
            if (curr.getConnectedDate() != null) {
                long days = java.time.temporal.ChronoUnit.DAYS.between(curr.getConnectedDate(), fin);
                if (days > 0 && curr.getCylinderWeightKg() != null) {
                    curr.setBurnRatePerDay(curr.getCylinderWeightKg() / days);
                }
            }
            curr.validateRecord();
            return gasRepo.save(curr);
        }).orElse(null);
    }

    @Transactional
    public void resetGasOnly(User user) {
        if (user == null) user = getDefaultDemoUser();
        if (user != null) {
            List<GasRecord> list = gasRepo.findByUserOrderByConnectedDateDesc(user);
            gasRepo.deleteAll(list);
        }
    }

    @Transactional
    public void seedDemoData() {
        clearAllData();

        User user = getDefaultDemoUser();
        if (user == null) {
            user = userRepo.save(new User("Rithish Kumar", "demo@smartledger.local", "$2a$10$eE04wW52gqW9YJg9Y4W91.oUvjJ9jW.832c3f5g5r2.u3W0j0w4aG"));
        }

        // Electricity
        electricityRepo.save(new ElectricityRecord(user, "2026-08", 350.0, 950.0, true, 140.0, 210.0, 380.0, LocalDate.of(2026, 8, 15)));
        electricityRepo.save(new ElectricityRecord(user, "2026-09", 420.0, 1265.0, true, 180.0, 240.0, 542.14, LocalDate.of(2026, 9, 15)));

        // Gas
        GasRecord finishedGas = new GasRecord(user, 14.2, 850.0, LocalDate.of(2026, 7, 1), LocalDate.of(2026, 8, 5), false);
        gasRepo.save(finishedGas);
        GasRecord activeGas = new GasRecord(user, 14.2, 850.0, LocalDate.of(2026, 8, 6), null, true);
        gasRepo.save(activeGas);

        // Telecom
        telecomRepo.save(new TelecomRecord(user, "Rithish (Self)", "Jio", 719.0, LocalDate.of(2026, 8, 1), 84, LocalDate.of(2026, 10, 24)));
        telecomRepo.save(new TelecomRecord(user, "Mom", "Airtel", 299.0, LocalDate.of(2026, 8, 27), 28, LocalDate.of(2026, 9, 24)));
        telecomRepo.save(new TelecomRecord(user, "Dad", "BSNL", 199.0, LocalDate.of(2026, 8, 10), 30, LocalDate.of(2026, 9, 9)));

        // Transport
        transportRepo.save(new TransportRecord(user, CommuteType.FUEL, "Rithish", "Home", "College Campus", 45.0, 2.5, 255.0, 18.0, 5.67, LocalDate.of(2026, 9, 18)));
        transportRepo.save(new TransportRecord(user, CommuteType.PUBLIC_TICKET, "Rithish", "Home", "City Center", 25.0, null, 40.0, null, 1.60, LocalDate.of(2026, 9, 20)));

        // Grocery
        groceryRepo.save(new GroceryRecord(user, "Reliance Fresh", GroceryCategory.ESSENTIAL_STAPLE, 1450.0, LocalDate.of(2026, 9, 10), "Rice 10kg, Wheat flour 5kg, Dal 2kg"));
        groceryRepo.save(new GroceryRecord(user, "Daily Dairy", GroceryCategory.DAIRY_PRODUCE, 380.0, LocalDate.of(2026, 9, 15), "Milk, curd, butter"));
        groceryRepo.save(new GroceryRecord(user, "Sweet Shop", GroceryCategory.SNACKS_DISCRETIONARY, 350.0, LocalDate.of(2026, 9, 18), "Gulab jamun, mixture"));
    }
}
