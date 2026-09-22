package com.smartledger.controller;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ViewController.class)
@TestPropertySource(locations = "classpath:application-test.properties")
class ViewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;
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
    void shouldRedirectUnauthenticatedDashboardToLogin() throws Exception {
        mockMvc.perform(get("/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login"));
    }

    @Test
    void shouldRenderDashboardForLoggedInUser() throws Exception {
        User user = new User("John", "john@example.com", "hash");
        user.setUserId(1L);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("LOGGED_IN_USER", user);

        when(dashboardSummaryService.getMacroBreakdown(any())).thenReturn(
                new MacroSpendSummaryDto(0,0,0,0,0,0, Map.of())
        );

        mockMvc.perform(get("/dashboard").session(session))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard"));
    }
}
