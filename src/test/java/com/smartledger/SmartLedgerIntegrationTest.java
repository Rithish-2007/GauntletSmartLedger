package com.smartledger;

import com.smartledger.domain.CommuteType;
import com.smartledger.domain.GroceryCategory;
import com.smartledger.domain.User;
import com.smartledger.dto.MacroSpendSummaryDto;
import com.smartledger.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class SmartLedgerIntegrationTest {

    @Autowired
    private UserService userService;
    @Autowired
    private ElectricityService electricityService;
    @Autowired
    private GasService gasService;
    @Autowired
    private TelecomService telecomService;
    @Autowired
    private TransportService transportService;
    @Autowired
    private GroceryService groceryService;
    @Autowired
    private DashboardSummaryService dashboardSummaryService;

    @Test
    void shouldExecuteCompleteUserJourneyAcrossAllFiveUtilityPillars() {
        // 1. Register user
        User user = userService.registerUser("Test User", "test@smartledger.local", "Password123!");
        assertThat(user.getUserId()).isNotNull();

        // 2. Electricity Fair Split (Master 350 units @ 950 total, my 140 / 350 -> share 380)
        var elec = electricityService.addRecord(user, "2026-09", 350.0, 140.0, 210.0, LocalDate.now());
        assertThat(elec.getCalculatedMyShare()).isEqualTo(380.0);

        // 3. Connect Gas Cylinder
        var gas = gasService.connectNewCylinder(user, 14.2, 850.0, LocalDate.now());
        assertThat(gas.getIsActive()).isTrue();

        // 4. Telecom recharge
        var telecom = telecomService.addRecharge(user, "Mom", "Airtel", 299.0, LocalDate.now(), 28);
        assertThat(telecom.getRecordId()).isNotNull();

        // 5. Transport Commute
        var trip = transportService.addTrip(user, CommuteType.FUEL, "Tester", "Home", "Campus", 45.0, 2.5, 255.0, LocalDate.now());
        assertThat(trip.getMileageCalculated()).isEqualTo(18.0);

        // 6. Grocery purchase
        var grocery = groceryService.addRecord(user, "Mart", GroceryCategory.ESSENTIAL_STAPLE, 500.0, LocalDate.now(), "Staples");
        assertThat(grocery.getTotalAmount()).isEqualTo(500.0);

        // 7. Macro Household Breakdown
        MacroSpendSummaryDto macro = dashboardSummaryService.getMacroBreakdown(user);
        assertThat(macro.totalMonthlySpend()).isEqualTo(380.0 + 850.0 + 299.0 + 255.0 + 500.0);
    }
}
