package com.smartledger.controller;

import com.smartledger.domain.User;
import com.smartledger.exception.UtilityValidationException;
import com.smartledger.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RestAuthController.class)
@TestPropertySource(locations = "classpath:application-test.properties")
class RestAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    void testLoginSuccess() throws Exception {
        User user = new User("Rithish Kumar", "rithish@test.com", "hashedPass");
        when(userService.authenticateUser(eq("rithish@test.com"), eq("secret123")))
                .thenReturn(Optional.of(user));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"rithish@test.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.user.email").value("rithish@test.com"))
                .andExpect(jsonPath("$.user.fullName").value("Rithish Kumar"));
    }

    @Test
    void testLoginFailure() throws Exception {
        when(userService.authenticateUser(eq("unknown@test.com"), eq("wrongpass")))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"unknown@test.com\",\"password\":\"wrongpass\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid email or password"));
    }

    @Test
    void testRegisterSuccess() throws Exception {
        User user = new User("Jane Doe", "jane@test.com", "hashedPass");
        when(userService.registerUser(eq("Jane Doe"), eq("jane@test.com"), eq("secret123")))
                .thenReturn(user);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Jane Doe\",\"email\":\"jane@test.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Registration successful"))
                .andExpect(jsonPath("$.user.email").value("jane@test.com"));
    }

    @Test
    void testRegisterDuplicateEmail() throws Exception {
        when(userService.registerUser(eq("Jane Doe"), eq("existing@test.com"), eq("secret123")))
                .thenThrow(new UtilityValidationException("An account with this email already exists"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Jane Doe\",\"email\":\"existing@test.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("An account with this email already exists"));
    }

    @Test
    void testRegisterWeakPasswordRejection() throws Exception {
        when(userService.registerUser(eq("Jane Doe"), eq("jane@test.com"), eq("weak")))
                .thenThrow(new UtilityValidationException("Password must contain at least 8 characters"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Jane Doe\",\"email\":\"jane@test.com\",\"password\":\"weak\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Password must contain at least 8 characters"));
    }

    @Test
    void testMeAuthenticated() throws Exception {
        User user = new User("Rithish Kumar", "rithish@test.com", "hashedPass");
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("LOGGED_IN_USER", user);

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("rithish@test.com"))
                .andExpect(jsonPath("$.fullName").value("Rithish Kumar"));
    }

    @Test
    void testMeUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
