package eu.moon.housingdb;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DisplayHousesController {
    @GetMapping("/housing-list")
    public String showUserList() {
        return "index";
    }
}
