package com.aiagent.controller;

import com.aiagent.dto.AIReportDto;
import com.aiagent.ai.AIService;
import com.aiagent.entity.ChatHistoryEntity;
import com.aiagent.entity.UserEntity;
import com.aiagent.repository.AIReportRepository;
import com.aiagent.repository.ChatHistoryRepository;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService            aiService;
    private final AIReportRepository   aiReportRepository;
    private final ChatHistoryRepository chatHistoryRepository;

    // ===== Code Review / Analysis =====

    /**
     * POST /api/ai/review
     * Triggers an AI code review for the specified repository.
     */
    @PostMapping("/review")
    public ResponseEntity<AIReportDto.ReportResponse> reviewRepository(
            @Valid @RequestBody AIReportDto.ReviewRequest request,
            @AuthenticationPrincipal UserEntity currentUser
    ) throws IOException {
        AIReportDto.ReportResponse response = aiService.analyzeRepository(request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/ai/reports/{repositoryId}
     * Returns all AI reports for a repository.
     */
    @GetMapping("/reports/{repositoryId}")
    public ResponseEntity<List<AIReportDto.ReportResponse>> getReports(
            @PathVariable Long repositoryId,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        List<AIReportDto.ReportResponse> responses = aiReportRepository
                .findByRepositoryId(repositoryId)
                .stream()
                .map(aiService::mapToReportResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // ===== Chat =====

    /**
     * POST /api/ai/chat
     * Sends a message to the AI (optionally with a repository context for RAG).
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponseBody> chat(
            @Valid @RequestBody ChatRequestBody request,
            @AuthenticationPrincipal UserEntity currentUser
    ) throws IOException {
        String reply = aiService.chat(request.getMessage(), request.getRepositoryId(), currentUser);
        return ResponseEntity.ok(new ChatResponseBody(reply));
    }

    /**
     * GET /api/ai/chat/history
     * Returns chat history for the current user (optionally filtered by repository).
     */
    @GetMapping("/chat/history")
    public ResponseEntity<List<ChatHistoryEntity>> getChatHistory(
            @RequestParam(required = false) Long repositoryId,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        List<ChatHistoryEntity> history = (repositoryId != null)
                ? chatHistoryRepository.findByUserIdAndRepositoryIdOrderByCreatedAtAsc(currentUser.getId(), repositoryId)
                : chatHistoryRepository.findByUserIdOrderByCreatedAtAsc(currentUser.getId());
        return ResponseEntity.ok(history);
    }

    // ===== Inner DTO classes =====

    @Data
    public static class ChatRequestBody {
        private String message;
        private Long   repositoryId; // optional
    }

    @Data
    public static class ChatResponseBody {
        private final String reply;
    }
}
