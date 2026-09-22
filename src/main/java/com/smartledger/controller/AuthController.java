package com.smartledger.controller;

import com.smartledger.domain.User;
import com.smartledger.exception.UtilityValidationException;
import com.smartledger.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

@Controller
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/login")
    public String loginPage(HttpSession session) {
        if (session.getAttribute("LOGGED_IN_USER") != null) return "redirect:/dashboard";
        return "login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String email, @RequestParam String password,
                        HttpSession session, Model model) {
        Optional<User> user = userService.authenticateUser(email, password);
        if (user.isPresent()) {
            session.setAttribute("LOGGED_IN_USER", user.get());
            return "redirect:/dashboard";
        }
        model.addAttribute("error", "Invalid email or password");
        return "login";
    }

    @GetMapping("/register")
    public String registerPage(HttpSession session) {
        if (session.getAttribute("LOGGED_IN_USER") != null) return "redirect:/dashboard";
        return "register";
    }

    @PostMapping("/register")
    public String register(@RequestParam String fullName, @RequestParam String email,
                           @RequestParam String password, HttpSession session, Model model) {
        try {
            User user = userService.registerUser(fullName, email, password);
            session.setAttribute("LOGGED_IN_USER", user);
            return "redirect:/dashboard";
        } catch (UtilityValidationException e) {
            model.addAttribute("error", e.getMessage());
            return "register";
        }
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
}
