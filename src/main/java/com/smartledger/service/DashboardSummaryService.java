package com.smartledger.service;

import com.smartledger.domain.ElectricityRecord;
import com.smartledger.domain.GasRecord;
import com.smartledger.domain.GroceryRecord;
import com.smartledger.domain.TelecomRecord;
import com.smartledger.domain.TransportRecord;
import com.smartledger.domain.User;
import com.smartledger.dto.MacroSpendSummaryDto;
import com.smartledger.repository.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardSummaryService {

    private final ElectricityRecordRepository electricityRepo;
    private final GasRecordRepository gasRepo;
    private final TelecomRecordRepository telecomRepo;
    private final TransportRecordRepository transportRepo;
    private final GroceryRecordRepository groceryRepo;

    public DashboardSummaryService(ElectricityRecordRepository electricityRepo, GasRecordRepository gasRepo,
                                  TelecomRecordRepository telecomRepo, TransportRecordRepository transportRepo,
                                  GroceryRecordRepository groceryRepo) {
        this.electricityRepo = electricityRepo;
        this.gasRepo = gasRepo;
        this.telecomRepo = telecomRepo;
        this.transportRepo = transportRepo;
        this.groceryRepo = groceryRepo;
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
}
