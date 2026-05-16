package com.aiagent.controller;

import com.aiagent.dto.AuthDto;
import com.aiagent.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    private final com.aiagent.repository.UserRepository userRepository; // yeh add karo

    /**
     * POST /api/auth/register
     * Body: { "username": "...", "email": "...", "password": "..." }
     */
    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(
            @Valid @RequestBody AuthDto.RegisterRequest request
    ) {
        AuthDto.AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login
     * Body: { "email": "...", "password": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(
            @Valid @RequestBody AuthDto.LoginRequest request
    ) {
        AuthDto.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/users/count")
    public ResponseEntity<?> getUserCount() {
        return ResponseEntity.ok(Map.of("totalUsers", userRepository.count()));
    }
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
