package com.aiagent.controller;

import com.aiagent.dto.RepositoryDto;
import com.aiagent.entity.UserEntity;
import com.aiagent.service.RepositoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repositories")
@RequiredArgsConstructor
public class RepositoryController {

    private final RepositoryService repositoryService;

    /**
     * POST /api/repositories/scan
     * Clones the repo and triggers an async AI analysis.
     */
    @PostMapping("/scan")
    public ResponseEntity<RepositoryDto.RepositoryResponse> scanRepository(
            @Valid @RequestBody RepositoryDto.ScanRequest request,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        RepositoryDto.RepositoryResponse response = repositoryService.scanRepository(request, currentUser);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    /**
     * GET /api/repositories
     * Returns all repositories belonging to the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<RepositoryDto.RepositoryResponse>> getUserRepositories(
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(repositoryService.getUserRepositories(currentUser));
    }

    /**
     * GET /api/repositories/{id}
     * Returns repository details including all AI reports.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RepositoryDto.RepositoryDetailResponse> getRepositoryDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(repositoryService.getRepositoryDetail(id, currentUser));
    }

    /**
     * DELETE /api/repositories/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRepository(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        repositoryService.deleteRepository(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
