package com.aiagent.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.UUID;

@Service
@Slf4j
public class GitCloneService {

    @Value("${repo.clone.base-dir}")
    private String baseCloneDir;

    /**
     * Clones a GitHub repository to a local directory.
     *
     * @param repoUrl  full GitHub HTTPS URL
     * @param branch   branch to checkout
     * @return local path where the repo was cloned
     */
    public String cloneRepository(String repoUrl, String branch) throws IOException, InterruptedException {
        // Create a unique directory for this clone
        String dirName   = UUID.randomUUID().toString();
        Path   targetDir = Paths.get(baseCloneDir, dirName);
        Files.createDirectories(targetDir);

        log.info("Cloning {} (branch: {}) to {}", repoUrl, branch, targetDir);

        ProcessBuilder pb = new ProcessBuilder(
                "git", "clone",
                "--branch", branch,
                "--depth", "1",   // shallow clone – fast
                repoUrl,
                targetDir.toString()
        );
        pb.redirectErrorStream(true);

        Process process = pb.start();
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            String output = new String(process.getInputStream().readAllBytes());
            // Clean up failed clone
            deleteDirectory(targetDir);
            throw new IOException("git clone failed (exit " + exitCode + "): " + output);
        }

        log.info("Clone successful: {}", targetDir);
        return targetDir.toString();
    }

    /**
     * Extracts the repository name from a GitHub URL.
     * Example: https://github.com/owner/my-repo.git  →  my-repo
     */
    public String extractRepoName(String repoUrl) {
        String name = repoUrl.replaceAll("\\.git$", "");
        int slash = name.lastIndexOf('/');
        return slash >= 0 ? name.substring(slash + 1) : name;
    }

    /** Recursively deletes a directory. Safe to call on non-existent paths. */
    public void deleteDirectory(Path dir) {
        if (!Files.exists(dir)) return;
        try {
            Files.walk(dir)
                 .sorted(Comparator.reverseOrder())
                 .map(Path::toFile)
                 .forEach(File::delete);
        } catch (IOException e) {
            log.warn("Could not fully delete directory {}: {}", dir, e.getMessage());
        }
    }
}
