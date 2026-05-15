package com.aiagent.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
public class FileScannerService {

    // File extensions that are likely source code
    private static final Set<String> SOURCE_EXTENSIONS = Set.of(
        ".java", ".js", ".ts", ".jsx", ".tsx", ".py", ".go", ".rb",
        ".php", ".cs", ".cpp", ".c", ".h", ".kt", ".swift", ".rs",
        ".scala", ".sh", ".yaml", ".yml", ".json", ".xml", ".sql",
        ".html", ".css", ".md"
    );

    // Directories to skip
    private static final Set<String> SKIP_DIRS = Set.of(
        "node_modules", ".git", "target", "build", "dist", ".idea",
        "__pycache__", ".gradle", ".mvn", "vendor", "out"
    );

    private static final long MAX_FILE_SIZE_BYTES = 100_000; // 100 KB per file
    private static final int MAX_FILES = 50;

    /**
     * Scans a cloned repository and returns a Map of relativePath → fileContent.
     * Limits the total size to keep AI prompts manageable.
     */
    public Map<String, String> scanRepository(String localPath) throws IOException {
        Path root = Paths.get(localPath);
        Map<String, String> files = new LinkedHashMap<>();

        try (Stream<Path> stream = Files.walk(root)) {
            List<Path> sourcePaths = stream
                    .filter(Files::isRegularFile)
                    .filter(p -> !isInSkippedDir(p))
                    .filter(this::isSourceFile)
                    .filter(p -> {
                        try { return Files.size(p) <= MAX_FILE_SIZE_BYTES; }
                        catch (IOException e) { return false; }
                    })
                    .limit(MAX_FILES)
                    .collect(Collectors.toList());

            for (Path path : sourcePaths) {
                try {
                    String content = Files.readString(path, StandardCharsets.UTF_8);
                    String relative = root.relativize(path).toString();
                    files.put(relative, content);
                } catch (IOException e) {
                    log.warn("Could not read file {}: {}", path, e.getMessage());
                }
            }
        }

        log.info("Scanned {} source files from {}", files.size(), localPath);
        return files;
    }

    /**
     * Reads a single file from the repository.
     */
    public String readFile(String localPath, String filePath) throws IOException {
        Path target = Paths.get(localPath, filePath);
        if (!Files.exists(target)) {
            throw new NoSuchFileException("File not found: " + filePath);
        }
        return Files.readString(target, StandardCharsets.UTF_8);
    }

    // ===== Helpers =====

    private boolean isSourceFile(Path path) {
        String name = path.getFileName().toString().toLowerCase();
        return SOURCE_EXTENSIONS.stream().anyMatch(name::endsWith);
    }

    private boolean isInSkippedDir(Path path) {
        for (Path part : path) {
            if (SKIP_DIRS.contains(part.toString())) return true;
        }
        return false;
    }

    /**
     * Truncates a map of files to a maximum total character count
     * so that AI prompts don't exceed context limits.
     */
    public String buildCodeContext(Map<String, String> files, int maxChars) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : files.entrySet()) {
            String block = "### File: " + entry.getKey() + "\n```\n" + entry.getValue() + "\n```\n\n";
            if (sb.length() + block.length() > maxChars) break;
            sb.append(block);
        }
        return sb.toString();
    }
}
