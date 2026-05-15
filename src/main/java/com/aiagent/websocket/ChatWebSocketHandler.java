package com.aiagent.websocket;

import com.aiagent.ai.AIService;
import com.aiagent.entity.UserEntity;
import com.aiagent.repository.UserRepository;
import com.aiagent.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final AIService aiService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private final Map<String, UserEntity> sessionUsers = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("WebSocket connected: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode payload = objectMapper.readTree(message.getPayload());

        // First message must be auth
        if (!sessionUsers.containsKey(session.getId())) {
            String token = payload.path("token").asText();
            String email = jwtService.extractUsername(token);
            userRepository.findByEmail(email).ifPresent(u -> sessionUsers.put(session.getId(), u));
            session.sendMessage(new TextMessage("{\"type\":\"auth\",\"status\":\"ok\"}"));
            return;
        }

        UserEntity user = sessionUsers.get(session.getId());
        String msg = payload.path("message").asText();
        Long repoId = payload.has("repositoryId") ? payload.path("repositoryId").asLong() : null;

        String reply = aiService.chat(msg, repoId, user);
        String response = objectMapper.writeValueAsString(Map.of("type", "message", "reply", reply));
        session.sendMessage(new TextMessage(response));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessionUsers.remove(session.getId());
        log.info("WebSocket disconnected: {}", session.getId());
    }
}
