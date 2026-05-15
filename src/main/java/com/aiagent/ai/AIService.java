package com.aiagent.ai;

import com.aiagent.dto.AIReportDto;
import com.aiagent.entity.AIReportEntity;
import com.aiagent.entity.ChatHistoryEntity;
import com.aiagent.entity.RepositoryEntity;
import com.aiagent.entity.UserEntity;
import com.aiagent.repository.AIReportRepository;
import com.aiagent.repository.ChatHistoryRepository;
import com.aiagent.repository.RepositoryRepository;
import com.aiagent.service.FileScannerService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final PromptManager       promptManager;
    private final FileScannerService  fileScannerService;
    private final AIReportRepository  aiReportRepository;
    private final ChatHistoryRepository chatHistoryRepository;
    private final RepositoryRepository  repositoryRepository;
    private final ObjectMapper          objectMapper;

    @Value("${openai.api.key}")
    private String openAiKey;

    @Value("${openai.api.url}")
    private String openAiUrl;

    @Value("${openai.model}")
    private String openAiModel;

    private static final int MAX_CONTEXT_CHARS = 60_000;
    private static final MediaType JSON = MediaType.get("application/json");

    // ===== Code Review / Analysis =====

    public AIReportDto.ReportResponse analyzeRepository(
            AIReportDto.ReviewRequest request,
            UserEntity currentUser
    ) throws IOException {

        RepositoryEntity repo = repositoryRepository.findByIdAndUserId(
                        request.getRepositoryId(), currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Repository not found or access denied"));

        // Build code context
        String codeContext;
        if (request.getFilePath() != null && !request.getFilePath().isBlank()) {
            // Single file analysis
            String content = fileScannerService.readFile(repo.getLocalPath(), request.getFilePath());
            codeContext = "### File: " + request.getFilePath() + "\n```\n" + content + "\n```\n";
        } else {
            Map<String, String> files = fileScannerService.scanRepository(repo.getLocalPath());
            codeContext = fileScannerService.buildCodeContext(files, MAX_CONTEXT_CHARS);
        }

        String userPrompt = promptManager.buildAnalysisPrompt(codeContext, request.getReportType());
        String aiResponse = callOpenAI(promptManager.getSystemPrompt(), userPrompt);

        // Persist report
        AIReportEntity reportEntity = AIReportEntity.builder()
                .repository(repo)
                .reportType(request.getReportType())
                .report(aiResponse)
                .filePath(request.getFilePath())
                .build();

        aiReportRepository.save(reportEntity);
        log.info("AI report saved for repo {} (type: {})", repo.getId(), request.getReportType());

        return mapToReportResponse(reportEntity);
    }

    // ===== Chat =====

    public String chat(String message, Long repositoryId, UserEntity currentUser) throws IOException {
        // Build optional code context for RAG-style chat
        String codeContext = null;
        RepositoryEntity repo = null;

        if (repositoryId != null) {
            repo = repositoryRepository.findByIdAndUserId(repositoryId, currentUser.getId())
                    .orElse(null);
            if (repo != null && repo.getLocalPath() != null) {
                Map<String, String> files = fileScannerService.scanRepository(repo.getLocalPath());
                codeContext = fileScannerService.buildCodeContext(files, 40_000);
            }
        }

        String userPrompt = promptManager.buildChatPrompt(message, codeContext);
        String aiResponse = callOpenAI(promptManager.getSystemPrompt(), userPrompt);

        // Persist both sides of the conversation
        ChatHistoryEntity userMsg = ChatHistoryEntity.builder()
                .user(currentUser)
                .repository(repo)
                .message(message)
                .sender(ChatHistoryEntity.Sender.USER)
                .build();
        chatHistoryRepository.save(userMsg);

        ChatHistoryEntity aiMsg = ChatHistoryEntity.builder()
                .user(currentUser)
                .repository(repo)
                .message(aiResponse)
                .sender(ChatHistoryEntity.Sender.AI)
                .build();
        chatHistoryRepository.save(aiMsg);

        return aiResponse;
    }

    // ===== Private: HTTP call to OpenAI =====

    private String callOpenAI(String systemPrompt, String userPrompt) throws IOException {
        OkHttpClient client = new OkHttpClient();

        // Build request body using Jackson nodes
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", openAiModel);
        body.put("max_tokens", 4096);

        ArrayNode messages = body.putArray("messages");

        ObjectNode systemMsg = messages.addObject();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);

        ObjectNode userMsg = messages.addObject();
        userMsg.put("role", "user");
        userMsg.put("content", userPrompt);

        RequestBody requestBody = RequestBody.create(
                objectMapper.writeValueAsString(body), JSON
        );

        Request request = new Request.Builder()
                .url(openAiUrl)
                .header("Authorization", "Bearer " + openAiKey)
                .header("Content-Type", "application/json")
                .post(requestBody)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "no body";
                throw new IOException("OpenAI API error " + response.code() + ": " + errorBody);
            }

            String responseBody = response.body().string();
            JsonNode json = objectMapper.readTree(responseBody);
            return json
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();
        }
    }

    // ===== Mapper =====

    public AIReportDto.ReportResponse mapToReportResponse(AIReportEntity entity) {
        return AIReportDto.ReportResponse.builder()
                .id(entity.getId())
                .repositoryId(entity.getRepository().getId())
                .reportType(entity.getReportType())
                .report(entity.getReport())
                .filePath(entity.getFilePath())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
