package com.smartledger.controller;

import com.smartledger.domain.*;
import com.smartledger.dto.*;
import com.smartledger.service.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Controller
public class ViewController {

    private final ElectricityService electricityService;
    private final GasService gasService;
    private final TelecomService telecomService;
    private final TransportService transportService;
    private final GroceryService groceryService;
    private final DashboardSummaryService dashboardSummaryService;

    public ViewController(ElectricityService electricityService, GasService gasService,
                          TelecomService telecomService, TransportService transportService,
                          GroceryService groceryService, DashboardSummaryService dashboardSummaryService) {
        this.electricityService = electricityService;
        this.gasService = gasService;
        this.telecomService = telecomService;
        this.transportService = transportService;
        this.groceryService = groceryService;
        this.dashboardSummaryService = dashboardSummaryService;
    }

    private User getSessionUser(HttpSession session) {
        return (User) session.getAttribute("LOGGED_IN_USER");
    }

    @GetMapping("/")
    public String root() {
        return "redirect:/dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        MacroSpendSummaryDto macro = dashboardSummaryService.getMacroBreakdown(user);
        Optional<DepletionForecast> gasForecast = gasService.getActiveForecast(user);
        List<TelecomCountdownDto> telecomMatrix = telecomService.getCountdownMatrix(user);

        model.addAttribute("user", user);
        model.addAttribute("macro", macro);
        model.addAttribute("gasForecast", gasForecast.orElse(null));
        model.addAttribute("telecomMatrix", telecomMatrix);

        return "dashboard";
    }

    @GetMapping("/electricity")
    public String electricityPage(HttpSession session, Model model) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        model.addAttribute("user", user);
        model.addAttribute("records", electricityService.getRecordsForUser(user));
        return "electricity";
    }

    @PostMapping("/electricity/add")
    public String addElectricity(@RequestParam String billingMonth, @RequestParam double masterUnits,
                                 @RequestParam double myUnits, @RequestParam(defaultValue = "0.0") double otherUnits,
                                 @RequestParam(required = false) LocalDate paidDate, HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        electricityService.addRecord(user, billingMonth, masterUnits, myUnits, otherUnits, paidDate);
        return "redirect:/electricity";
    }

    @GetMapping("/gas")
    public String gasPage(HttpSession session, Model model) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        model.addAttribute("user", user);
        model.addAttribute("records", gasService.getAllForUser(user));
        model.addAttribute("forecast", gasService.getActiveForecast(user).orElse(null));
        return "gas";
    }

    @PostMapping("/gas/connect")
    public String connectGas(@RequestParam(defaultValue = "14.2") double weightKg,
                             @RequestParam double bookingCost,
                             @RequestParam(required = false) LocalDate connectedDate,
                             HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        gasService.connectNewCylinder(user, weightKg, bookingCost, connectedDate != null ? connectedDate : LocalDate.now());
        return "redirect:/gas";
    }

    @GetMapping("/telecom")
    public String telecomPage(HttpSession session, Model model) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        model.addAttribute("user", user);
        model.addAttribute("matrix", telecomService.getCountdownMatrix(user));
        return "telecom";
    }

    @PostMapping("/telecom/add")
    public String addTelecom(@RequestParam String memberName, @RequestParam String provider,
                             @RequestParam double amount, @RequestParam(required = false) LocalDate rechargeDate,
                             @RequestParam int validityDays, HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        telecomService.addRecharge(user, memberName, provider, amount, rechargeDate != null ? rechargeDate : LocalDate.now(), validityDays);
        return "redirect:/telecom";
    }

    @GetMapping({"/transport", "/mobility"})
    public String transportPage(HttpSession session, Model model) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        model.addAttribute("user", user);
        model.addAttribute("trips", transportService.getTripsForUser(user));
        return "transport";
    }

    @PostMapping({"/transport/add", "/mobility/add"})
    public String addTrip(@RequestParam CommuteType type, @RequestParam String personName,
                          @RequestParam(required = false) String origin, @RequestParam(required = false) String destination,
                          @RequestParam double distanceKm, @RequestParam(required = false) Double liters,
                          @RequestParam double totalFare, @RequestParam(required = false) LocalDate date,
                          HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        transportService.addTrip(user, type, personName, origin, destination, distanceKm, liters, totalFare, date);
        return "redirect:/transport";
    }

    @GetMapping({"/grocery", "/pantry"})
    public String groceryPage(HttpSession session, Model model) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        model.addAttribute("user", user);
        model.addAttribute("records", groceryService.getRecords(user));
        model.addAttribute("summary", groceryService.getSummary(user));
        return "grocery";
    }

    @PostMapping("/grocery/add")
    public String addGrocery(@RequestParam(required = false) String storeName, @RequestParam GroceryCategory category,
                             @RequestParam double amount, @RequestParam(required = false) LocalDate date,
                             @RequestParam(required = false) String notes, HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        groceryService.addRecord(user, storeName, category, amount, date != null ? date : LocalDate.now(), notes);
        return "redirect:/grocery";
    }
}
