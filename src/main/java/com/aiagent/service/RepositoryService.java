package com.aiagent.service;

import com.aiagent.dto.AIReportDto;
import com.aiagent.dto.RepositoryDto;
import com.aiagent.ai.AIService;
import com.aiagent.entity.AIReportEntity;
import com.aiagent.entity.RepositoryEntity;
import com.aiagent.entity.UserEntity;
import com.aiagent.repository.AIReportRepository;
import com.aiagent.repository.RepositoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RepositoryService {

    private final RepositoryRepository repositoryRepository;
    private final AIReportRepository   aiReportRepository;
    private final GitCloneService      gitCloneService;
    private final AIService            aiService;

    // ===== Scan (clone + async AI analysis) =====

    public RepositoryDto.RepositoryResponse scanRepository(
            RepositoryDto.ScanRequest request,
            UserEntity currentUser
    ) {
        if (repositoryRepository.existsByRepoUrlAndUserId(request.getRepoUrl(), currentUser.getId())) {
            throw new IllegalArgumentException("Repository already added: " + request.getRepoUrl());
        }

        String repoName = gitCloneService.extractRepoName(request.getRepoUrl());

        RepositoryEntity repo = RepositoryEntity.builder()
                .repoName(repoName)
                .repoUrl(request.getRepoUrl())
                .defaultBranch(request.getBranch())
                .user(currentUser)
                .status(RepositoryEntity.ScanStatus.PENDING)
                .build();

        repositoryRepository.save(repo);

        // Clone + analyse in a background thread so the API returns immediately
        cloneAndAnalyseAsync(repo.getId(), request.getRepoUrl(), request.getBranch());

        return mapToResponse(repo);
    }

    @Async
    public void cloneAndAnalyseAsync(Long repoId, String repoUrl, String branch) {
        RepositoryEntity repo = repositoryRepository.findById(repoId)
                .orElseThrow(() -> new IllegalArgumentException("Repository not found: " + repoId));
        try {
            // 1. Clone
            repo.setStatus(RepositoryEntity.ScanStatus.CLONING);
            repositoryRepository.save(repo);

            String localPath = gitCloneService.cloneRepository(repoUrl, branch);
            repo.setLocalPath(localPath);

            // 2. Auto-run general analysis
            repo.setStatus(RepositoryEntity.ScanStatus.SCANNING);
            repositoryRepository.save(repo);

            AIReportDto.ReviewRequest reviewRequest = new AIReportDto.ReviewRequest();
            reviewRequest.setRepositoryId(repoId);
            reviewRequest.setReportType(AIReportEntity.ReportType.GENERAL);

            aiService.analyzeRepository(reviewRequest, repo.getUser());

            repo.setStatus(RepositoryEntity.ScanStatus.COMPLETED);
            repositoryRepository.save(repo);
            log.info("Repository {} scanned successfully", repoId);

        } catch (Exception e) {
            log.error("Failed to scan repository {}: {}", repoId, e.getMessage(), e);
            repo.setStatus(RepositoryEntity.ScanStatus.FAILED);
            repositoryRepository.save(repo);
        }
    }

    // ===== Read =====

    @Transactional(readOnly = true)   // ← add this line

    public List<RepositoryDto.RepositoryResponse> getUserRepositories(UserEntity user) {
        return repositoryRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RepositoryDto.RepositoryDetailResponse getRepositoryDetail(Long repoId, UserEntity user) {
        RepositoryEntity repo = repositoryRepository.findByIdAndUserId(repoId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Repository not found or access denied"));

        List<AIReportEntity> reports = aiReportRepository.findByRepositoryId(repoId);
        List<AIReportDto.ReportResponse> reportResponses = reports.stream()
                .map(aiService::mapToReportResponse)
                .collect(Collectors.toList());

        return RepositoryDto.RepositoryDetailResponse.builder()
                .id(repo.getId())
                .repoName(repo.getRepoName())
                .repoUrl(repo.getRepoUrl())
                .defaultBranch(repo.getDefaultBranch())
                .status(repo.getStatus())
                .createdAt(repo.getCreatedAt())
                .reports(reportResponses)
                .build();
    }

    // ===== Delete =====

    public void deleteRepository(Long repoId, UserEntity user) {
        RepositoryEntity repo = repositoryRepository.findByIdAndUserId(repoId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Repository not found or access denied"));
        repositoryRepository.delete(repo);
        log.info("Repository {} deleted by user {}", repoId, user.getId());
    }

    // ===== Mapper =====

    private RepositoryDto.RepositoryResponse mapToResponse(RepositoryEntity repo) {
        int reportCount = (repo.getReports() != null) ? repo.getReports().size() : 0;
        return RepositoryDto.RepositoryResponse.builder()
                .id(repo.getId())
                .repoName(repo.getRepoName())
                .repoUrl(repo.getRepoUrl())
                .defaultBranch(repo.getDefaultBranch())
                .status(repo.getStatus())
                .createdAt(repo.getCreatedAt())
                .reportCount(reportCount)
                .build();
    }
}
