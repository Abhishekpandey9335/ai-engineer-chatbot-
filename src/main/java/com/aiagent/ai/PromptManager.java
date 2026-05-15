package com.aiagent.ai;

import com.aiagent.entity.AIReportEntity;
import org.springframework.stereotype.Component;

@Component
public class PromptManager {

    private static final String SYSTEM_BASE =
            "You are an expert senior software engineer and code reviewer. " +
            "You provide clear, actionable, structured feedback.";

    public String getSystemPrompt() {
        return SYSTEM_BASE;
    }

    public String buildAnalysisPrompt(String codeContext, AIReportEntity.ReportType reportType) {
        String task = switch (reportType) {
            case CODE_REVIEW -> """
                    Perform a thorough code review. For each file, identify:
                    1. Code quality issues (naming, structure, duplication)
                    2. Performance problems
                    3. Design pattern violations
                    4. Missing error handling
                    5. Suggestions for improvement
                    Format your response with clear sections per file.
                    """;
            case BUG_DETECTION -> """
                    Analyze the code for bugs and defects. For each bug found:
                    1. State the file and approximate line
                    2. Describe the bug clearly
                    3. Explain the impact
                    4. Provide a fixed code snippet
                    Focus on: null pointer issues, off-by-one errors, race conditions, resource leaks.
                    """;
            case DOCUMENTATION -> """
                    Generate comprehensive documentation for this codebase:
                    1. Project overview and purpose
                    2. Architecture description
                    3. Key classes / modules and their responsibilities
                    4. Public API reference (methods, parameters, return values)
                    5. Setup and usage instructions
                    Use Markdown format.
                    """;
            case SECURITY_AUDIT -> """
                    Perform a security audit. Check for:
                    1. SQL injection vulnerabilities
                    2. XSS vulnerabilities
                    3. Insecure deserialization
                    4. Hard-coded secrets or credentials
                    5. Missing authentication / authorization checks
                    6. Insecure dependencies
                    Rate each finding: CRITICAL / HIGH / MEDIUM / LOW.
                    """;
            default -> """
                    Analyze the following code and provide:
                    1. Summary of what the project does
                    2. Overall code quality rating (1-10) with justification
                    3. Top 5 issues to fix
                    4. Top 3 things done well
                    5. Recommended next steps
                    """;
        };

        return "You are given the following codebase:\n\n" + codeContext +
               "\n\n---\nTask:\n" + task;
    }

    public String buildChatPrompt(String userMessage, String codeContext) {
        String context = (codeContext != null && !codeContext.isBlank())
                ? "You have access to the following codebase:\n\n" + codeContext + "\n\n---\n"
                : "";
        return context + "User question: " + userMessage;
    }
}
