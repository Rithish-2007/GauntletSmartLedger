package com.smartledger.controller;

import com.smartledger.domain.CommuteType;
import com.smartledger.domain.GroceryCategory;
import com.smartledger.domain.User;
import com.smartledger.dto.MacroSpendSummaryDto;
import com.smartledger.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApiController.class)
@TestPropertySource(locations = "classpath:application-test.properties")
class ApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ElectricityService electricityService;

    @MockBean
    private GasService gasService;

    @MockBean
    private TelecomService telecomService;

    @MockBean
    private TransportService transportService;

    @MockBean
    private GroceryService groceryService;

    @MockBean
    private DashboardSummaryService dashboardSummaryService;

    @Test
    void shouldReturnMacroAnalyticsWhenUserLoggedIn() throws Exception {
        User user = new User("John", "john@example.com", "hash");
        user.setUserId(1L);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("LOGGED_IN_USER", user);

        MacroSpendSummaryDto macro = new MacroSpendSummaryDto(
                1250.0, 850.0, 719.0, 1500.0, 2500.0, 6819.0,
                Map.of("Electricity", 1250.0, "Gas", 850.0, "Telecom", 719.0, "Transport", 1500.0, "Grocery", 2500.0)
        );

        when(dashboardSummaryService.getMacroBreakdown(any(User.class))).thenReturn(macro);

        mockMvc.perform(get("/api/analytics/macro").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalMonthlySpend").value(6819.0))
                .andExpect(jsonPath("$.electricitySpend").value(1250.0));
    }

    @Test
    void shouldReturnUnauthorizedWhenNoSession() throws Exception {
        mockMvc.perform(get("/api/analytics/macro"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldAddElectricityRecordAndReturnOverview() throws Exception {
        User user = new User("John", "john@example.com", "hash");
        user.setUserId(1L);
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("LOGGED_IN_USER", user);

        when(dashboardSummaryService.getDetailedOverview(any(User.class)))
                .thenReturn(Map.of("status", "success"));

        mockMvc.perform(post("/api/analytics/electricity/add")
                        .session(session)
                        .param("billingMonth", "2026-09")
                        .param("totalEbAmount", "1200.0")
                        .param("myUnits", "150.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));
    }

    @Test
    void shouldDeleteElectricityRecord() throws Exception {
        User user = new User("John", "john@example.com", "hash");
        user.setUserId(1L);
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("LOGGED_IN_USER", user);

        when(dashboardSummaryService.getDetailedOverview(any(User.class)))
                .thenReturn(Map.of("status", "success"));

        mockMvc.perform(delete("/api/analytics/electricity/1")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));
    }

    @Test
    void shouldFinishGasAndReturnOverview() throws Exception {
        User user = new User("John", "john@example.com", "hash");
        user.setUserId(1L);
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("LOGGED_IN_USER", user);

        when(dashboardSummaryService.getDetailedOverview(any(User.class)))
                .thenReturn(Map.of("gasStatus", "finished"));

        mockMvc.perform(post("/api/analytics/gas/finish")
                        .session(session)
                        .param("finishedDate", "2026-09-23"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gasStatus").value("finished"));
    }

    @Test
    void shouldAddTelecomRecordAndReturnOverview() throws Exception {
        User user = new User("John", "john@example.com", "hash");
        user.setUserId(1L);
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("LOGGED_IN_USER", user);

        when(dashboardSummaryService.getDetailedOverview(any(User.class)))
                .thenReturn(Map.of("telecomAdded", true));

        mockMvc.perform(post("/api/analytics/telecom/add")
                        .session(session)
                        .param("memberName", "Dad")
                        .param("provider", "Jio")
                        .param("amount", "299.0")
                        .param("validityDays", "28"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.telecomAdded").value(true));
    }

    @Test
    void shouldAddTransportTripAndReturnOverview() throws Exception {
        User user = new User("John", "john@example.com", "hash");
        user.setUserId(1L);
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("LOGGED_IN_USER", user);

        when(dashboardSummaryService.getDetailedOverview(any(User.class)))
                .thenReturn(Map.of("transportAdded", true));

        mockMvc.perform(post("/api/analytics/transport/add")
                        .session(session)
                        .param("type", "FUEL")
                        .param("personName", "Bike")
                        .param("totalFare", "200.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transportAdded").value(true));
    }

    @Test
    void shouldAddGroceryInvoiceAndReturnOverview() throws Exception {
        User user = new User("John", "john@example.com", "hash");
        user.setUserId(1L);
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("LOGGED_IN_USER", user);

        when(dashboardSummaryService.getDetailedOverview(any(User.class)))
                .thenReturn(Map.of("groceryAdded", true));

        mockMvc.perform(post("/api/analytics/grocery/add")
                        .session(session)
                        .param("storeName", "Supermart")
                        .param("category", "ESSENTIAL_STAPLE")
                        .param("amount", "650.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groceryAdded").value(true));
    }
}
