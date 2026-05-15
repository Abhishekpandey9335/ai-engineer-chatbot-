package com.aiagent.repository;

import com.aiagent.entity.ChatHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatHistoryRepository extends JpaRepository<ChatHistoryEntity, Long> {
    List<ChatHistoryEntity> findByUserIdOrderByCreatedAtAsc(Long userId);
    List<ChatHistoryEntity> findByUserIdAndRepositoryIdOrderByCreatedAtAsc(Long userId, Long repositoryId);
}
