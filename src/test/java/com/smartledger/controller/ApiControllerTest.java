package com.smartledger.controller;

import com.smartledger.domain.User;
import com.smartledger.dto.MacroSpendSummaryDto;
import com.smartledger.service.DashboardSummaryService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApiController.class)
@TestPropertySource(locations = "classpath:application-test.properties")
class ApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
}
