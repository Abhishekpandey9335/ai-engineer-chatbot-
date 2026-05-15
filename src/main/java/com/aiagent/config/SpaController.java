package com.aiagent.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Catch-all controller that forwards all non-API, non-asset routes to index.html
 * so React Router handles client-side navigation.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
        "/login", "/signup", "/dashboard", "/repositories/**",
        "/chat/**", "/analytics", "/profile"
    })
    public String forward(HttpServletRequest request) {
        return "forward:/index.html";
    }
}
