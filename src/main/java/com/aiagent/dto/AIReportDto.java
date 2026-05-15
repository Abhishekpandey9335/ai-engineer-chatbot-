package com.aiagent.dto;

import com.aiagent.entity.AIReportEntity;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

public class AIReportDto {

    @Data
    public static class ReviewRequest {
        @NotNull
        private Long repositoryId;

        @NotNull
        private AIReportEntity.ReportType reportType;

        private String filePath; // optional – null means whole repo
    }

    @Data
    @Builder
    public static class ReportResponse {
        private Long id;
        private Long repositoryId;
        private AIReportEntity.ReportType reportType;
        private String report;
        private String filePath;
        private LocalDateTime createdAt;
    }
}
