package com.aiagent.repository;

import com.aiagent.entity.AIReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AIReportRepository extends JpaRepository<AIReportEntity, Long> {
    List<AIReportEntity> findByRepositoryId(Long repositoryId);
}
