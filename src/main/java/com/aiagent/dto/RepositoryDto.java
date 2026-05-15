package com.aiagent.dto;

import com.aiagent.entity.RepositoryEntity;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

public class RepositoryDto {

    @Data
    public static class ScanRequest {
        @NotBlank(message = "Repository URL is required")
        private String repoUrl;

        private String branch = "main";
    }

    @Data
    @Builder
    public static class RepositoryResponse {
        private Long id;
        private String repoName;
        private String repoUrl;
        private String defaultBranch;
        private RepositoryEntity.ScanStatus status;
        private LocalDateTime createdAt;
        private int reportCount;
    }

    @Data
    @Builder
    public static class RepositoryDetailResponse {
        private Long id;
        private String repoName;
        private String repoUrl;
        private String defaultBranch;
        private RepositoryEntity.ScanStatus status;
        private LocalDateTime createdAt;
        private List<AIReportDto.ReportResponse> reports;
    }
}
