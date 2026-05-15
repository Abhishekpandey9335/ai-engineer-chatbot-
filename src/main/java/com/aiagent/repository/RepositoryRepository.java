package com.aiagent.repository;

import com.aiagent.entity.RepositoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RepositoryRepository extends JpaRepository<RepositoryEntity, Long> {
    List<RepositoryEntity> findByUserId(Long userId);
    Optional<RepositoryEntity> findByIdAndUserId(Long id, Long userId);
    boolean existsByRepoUrlAndUserId(String repoUrl, Long userId);
}
