package com.smartledger.controller;

import com.smartledger.domain.CommuteType;
import com.smartledger.domain.GroceryCategory;
import com.smartledger.domain.User;
import com.smartledger.dto.MacroSpendSummaryDto;
import com.smartledger.dto.SubMeterShareResult;
import com.smartledger.service.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class ApiController {

    private final ElectricityService electricityService;
    private final GasService gasService;
    private final TelecomService telecomService;
    private final TransportService transportService;
    private final GroceryService groceryService;
    private final DashboardSummaryService dashboardSummaryService;

    public ApiController(ElectricityService electricityService,
                         GasService gasService,
                         TelecomService telecomService,
                         TransportService transportService,
                         GroceryService groceryService,
                         DashboardSummaryService dashboardSummaryService) {
        this.electricityService = electricityService;
        this.gasService = gasService;
        this.telecomService = telecomService;
        this.transportService = transportService;
        this.groceryService = groceryService;
        this.dashboardSummaryService = dashboardSummaryService;
    }

    private User resolveUser(HttpSession session, String email, String demo) {
        if (session != null && session.getAttribute("LOGGED_IN_USER") != null) {
            return (User) session.getAttribute("LOGGED_IN_USER");
        }
        if (email != null && !email.isBlank()) {
            return dashboardSummaryService.getUserByEmail(email);
        }
        if ("true".equalsIgnoreCase(demo)) {
            return dashboardSummaryService.getDefaultDemoUser();
        }
        return null;
    }

    @GetMapping("/macro")
    public ResponseEntity<MacroSpendSummaryDto> getMacroAnalytics(
            HttpSession session,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String demo) {
        User user = resolveUser(session, email, demo);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(dashboardSummaryService.getMacroBreakdown(user));
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getDetailedOverview(
            HttpSession session,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String demo) {
        User user = resolveUser(session, email, demo != null ? demo : "true");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    @GetMapping("/simulate-electricity")
    public ResponseEntity<SubMeterShareResult> simulateElectricity(
            @RequestParam double masterUnits,
            @RequestParam double myUnits,
            @RequestParam(defaultValue = "0.0") double otherUnits) {
        return ResponseEntity.ok(dashboardSummaryService.simulateElectricity(masterUnits, myUnits, otherUnits));
    }

    // ==================== Electricity Mutations ====================

    @PostMapping("/electricity/add")
    public ResponseEntity<Map<String, Object>> addElectricity(
            HttpSession session,
            @RequestParam(required = false) String email,
            @RequestParam String billingMonth,
            @RequestParam(required = false) Double totalEbAmount,
            @RequestParam double myUnits,
            @RequestParam(defaultValue = "0.0") double otherUnits,
            @RequestParam(required = false) String paidDate) {
        User user = resolveUser(session, email, "true");
        LocalDate date = (paidDate != null && !paidDate.isBlank()) ? LocalDate.parse(paidDate) : LocalDate.now();
        electricityService.addRecordWithAmount(user, billingMonth, totalEbAmount, myUnits, otherUnits, date);
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    @DeleteMapping("/electricity/{id}")
    public ResponseEntity<Map<String, Object>> deleteElectricity(
            HttpSession session,
            @PathVariable Long id,
            @RequestParam(required = false) String email) {
        User user = resolveUser(session, email, "true");
        electricityService.deleteRecord(user, id);
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    // ==================== Gas Mutations ====================

    @PostMapping("/gas/connect")
    public ResponseEntity<Map<String, Object>> connectGas(
            HttpSession session,
            @RequestParam(required = false) String email,
            @RequestParam(defaultValue = "14.2") double weightKg,
            @RequestParam(defaultValue = "850.0") double bookingCost,
            @RequestParam(required = false) String connectedDate) {
        User user = resolveUser(session, email, "true");
        LocalDate date = (connectedDate != null && !connectedDate.isBlank())
                ? LocalDate.parse(connectedDate)
                : LocalDate.now();
        dashboardSummaryService.connectGas(user, weightKg, bookingCost, date);
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    @PostMapping("/gas/finish")
    public ResponseEntity<Map<String, Object>> finishGas(
            HttpSession session,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String finishedDate) {
        User user = resolveUser(session, email, "true");
        LocalDate date = (finishedDate != null && !finishedDate.isBlank())
                ? LocalDate.parse(finishedDate)
                : LocalDate.now();
        dashboardSummaryService.finishGas(user, date);
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    @DeleteMapping("/gas/{id}")
    public ResponseEntity<Map<String, Object>> deleteGas(
            HttpSession session,
            @PathVariable Long id,
            @RequestParam(required = false) String email) {
        User user = resolveUser(session, email, "true");
        gasService.deleteRecord(user, id);
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    @PostMapping("/gas/reset")
    public ResponseEntity<Map<String, Object>> resetGas(
            HttpSession session,
            @RequestParam(required = false) String email) {
        User user = resolveUser(session, email, "true");
        dashboardSummaryService.resetGasOnly(user);
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    // ==================== Telecom Mutations ====================

    @PostMapping("/telecom/add")
    public ResponseEntity<Map<String, Object>> addTelecom(
            HttpSession session,
            @RequestParam(required = false) String email,
            @RequestParam String memberName,
            @RequestParam String provider,
            @RequestParam double amount,
            @RequestParam(required = false) String rechargeDate,
            @RequestParam int validityDays) {
        User user = resolveUser(session, email, "true");
        LocalDate date = (rechargeDate != null && !rechargeDate.isBlank()) ? LocalDate.parse(rechargeDate) : LocalDate.now();
        telecomService.addRecharge(user, memberName, provider, amount, date, validityDays);
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    @DeleteMapping("/telecom/{id}")
    public ResponseEntity<Map<String, Object>> deleteTelecom(
            HttpSession session,
            @PathVariable Long id,
            @RequestParam(required = false) String email) {
        User user = resolveUser(session, email, "true");
        telecomService.deleteRecord(user, id);
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    // ==================== Transport Mutations ====================

    @PostMapping("/transport/add")
    public ResponseEntity<Map<String, Object>> addTransport(
            HttpSession session,
            @RequestParam(required = false) String email,
            @RequestParam CommuteType type,
            @RequestParam String personName,
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) Double distanceKm,
            @RequestParam(required = false) Double liters,
            @RequestParam double totalFare,
            @RequestParam(required = false) String date) {
        User user = resolveUser(session, email, "true");
        LocalDate parsedDate = (date != null && !date.isBlank()) ? LocalDate.parse(date) : LocalDate.now();
        transportService.addTrip(user, type, personName, origin, destination, distanceKm, liters, totalFare, parsedDate);
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    @DeleteMapping("/transport/{id}")
    public ResponseEntity<Map<String, Object>> deleteTransport(
            HttpSession session,
            @PathVariable Long id,
            @RequestParam(required = false) String email) {
        User user = resolveUser(session, email, "true");
        transportService.deleteRecord(user, id);
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    // ==================== Grocery Mutations ====================

    @PostMapping("/grocery/add")
    public ResponseEntity<Map<String, Object>> addGrocery(
            HttpSession session,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String storeName,
            @RequestParam GroceryCategory category,
            @RequestParam double amount,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String notes) {
        User user = resolveUser(session, email, "true");
        LocalDate parsedDate = (date != null && !date.isBlank()) ? LocalDate.parse(date) : LocalDate.now();
        groceryService.addRecord(user, storeName, category, amount, parsedDate, notes);
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    @DeleteMapping("/grocery/{id}")
    public ResponseEntity<Map<String, Object>> deleteGrocery(
            HttpSession session,
            @PathVariable Long id,
            @RequestParam(required = false) String email) {
        User user = resolveUser(session, email, "true");
        groceryService.deleteRecord(user, id);
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    // ==================== General Data Reset & Seed ====================

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetData(
            HttpSession session,
            @RequestParam(required = false) String email) {
        dashboardSummaryService.resetData();
        User user = resolveUser(session, email, "true");
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    @PostMapping("/clear")
    public ResponseEntity<Map<String, Object>> clearAllData(
            HttpSession session,
            @RequestParam(required = false) String email) {
        dashboardSummaryService.clearAllData();
        User user = resolveUser(session, email, "true");
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    @PostMapping("/seed-demo")
    public ResponseEntity<Map<String, Object>> seedDemoData(
            HttpSession session,
            @RequestParam(required = false) String email) {
        dashboardSummaryService.seedDemoData();
        User user = resolveUser(session, email, "true");
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }

    @PostMapping("/simulate-expense")
    public ResponseEntity<Map<String, Object>> simulateExpense(
            HttpSession session,
            @RequestParam(required = false) String email) {
        User user = resolveUser(session, email, "true");
        dashboardSummaryService.addSimulatedExpense(user);
        return ResponseEntity.ok(dashboardSummaryService.getDetailedOverview(user));
    }
}
