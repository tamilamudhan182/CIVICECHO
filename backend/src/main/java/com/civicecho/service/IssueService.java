package com.civicecho.service;

import com.civicecho.model.CivicIssue;
import com.civicecho.model.IssueVote;
import com.civicecho.model.User;
import com.civicecho.repository.IssueRepository;
import com.civicecho.repository.IssueVoteRepository;
import com.civicecho.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final IssueVoteRepository issueVoteRepository;

    @Autowired
    public IssueService(IssueRepository issueRepository, UserRepository userRepository, IssueVoteRepository issueVoteRepository) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.issueVoteRepository = issueVoteRepository;
    }

    public static class AuthorityInfo {
        public final String department;
        public final String assignedAuthority;

        public AuthorityInfo(String department, String assignedAuthority) {
            this.department = department;
            this.assignedAuthority = assignedAuthority;
        }
    }

    public AuthorityInfo resolveAuthority(String category) {
        if (category == null) return new AuthorityInfo("infrastructure", "Roads & Infrastructure Department");
        String cat = category.trim().toLowerCase();
        switch (cat) {
            case "health":
                return new AuthorityInfo("health", "Public Health Board");
            case "safety":
                return new AuthorityInfo("safety", "Safety & Traffic Control");
            case "sanitation":
                return new AuthorityInfo("sanitation", "Sanitation & Waste Board");
            case "water":
                return new AuthorityInfo("water", "Water Supply & Drainage Board");
            case "electricity":
                return new AuthorityInfo("electricity", "Electricity & Power Board");
            case "infrastructure":
            default:
                return new AuthorityInfo("infrastructure", "Roads & Infrastructure Department");
        }
    }

    /**
     * BUSINESS RULE 1: Priority Score Calculation
     * Priority = BaseUrgencyWeight + (ClusterCount * 5.0) + (Math.abs(SentimentScore) * 10.0)
     */
    public Double calculatePriorityScore(String urgency, Integer clusterCount, Double sentimentScore) {
        double baseUrgencyWeight;
        if ("CRITICAL".equalsIgnoreCase(urgency)) {
            baseUrgencyWeight = 40.0;
        } else if ("HIGH".equalsIgnoreCase(urgency)) {
            baseUrgencyWeight = 30.0;
        } else if ("MEDIUM".equalsIgnoreCase(urgency)) {
            baseUrgencyWeight = 20.0;
        } else {
            baseUrgencyWeight = 10.0;
        }

        int clusters = (clusterCount != null && clusterCount > 0) ? clusterCount : 1;
        double sentimentMultiplier = (sentimentScore != null) ? Math.abs(sentimentScore) * 10.0 : 5.0;

        return baseUrgencyWeight + (clusters * 5.0) + sentimentMultiplier;
    }

    public List<CivicIssue> getAllIssues() {
        return issueRepository.findAllByOrderByPriorityScoreDesc();
    }

    public Optional<CivicIssue> getIssueById(Long id) {
        return issueRepository.findById(id);
    }

    @Transactional
    public CivicIssue createIssue(CivicIssue issue) {
        if (issue.getUrgency() == null || issue.getUrgency().isEmpty()) {
            issue.setUrgency("MEDIUM");
        }
        if (issue.getClusterCount() == null) {
            issue.setClusterCount(1);
        }
        if (issue.getSentimentScore() == null) {
            issue.setSentimentScore(-0.6);
        }
        if (issue.getStatus() == null) {
            issue.setStatus("PENDING");
        }
        if (issue.getReportedAt() == null) {
            issue.setReportedAt(LocalDateTime.now());
        }

        // Auto-assign department & authority board
        AuthorityInfo auth = resolveAuthority(issue.getCategory());
        if (issue.getDepartment() == null || issue.getDepartment().trim().isEmpty()) {
            issue.setDepartment(auth.department);
        }
        if (issue.getAssignedAuthority() == null || issue.getAssignedAuthority().trim().isEmpty()) {
            issue.setAssignedAuthority(auth.assignedAuthority);
        }

        // Apply Business Rule 1
        Double calculatedScore = calculatePriorityScore(
                issue.getUrgency(), 
                issue.getClusterCount(), 
                issue.getSentimentScore()
        );
        issue.setPriorityScore(calculatedScore);

        // Update reporting user stats if user email provided (+50 Civic Points)
        if (issue.getReportedBy() != null && !issue.getReportedBy().trim().isEmpty()) {
            userRepository.findByEmailIgnoreCase(issue.getReportedBy().trim()).ifPresent(user -> {
                user.setIssuesReported((user.getIssuesReported() != null ? user.getIssuesReported() : 0) + 1);
                user.setPoints((user.getPoints() != null ? user.getPoints() : 0) + 50);
                userRepository.save(user);
            });
        }

        return issueRepository.save(issue);
    }

    /**
     * BUSINESS RULE 2: Issue Resolution & Civic Reward Points Allocation
     * When status becomes RESOLVED, set resolvedAt timestamp and award 100 reward points to reporting citizen.
     */
    @Transactional
    public CivicIssue updateIssueStatus(Long issueId, String newStatus) {
        CivicIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found with ID: " + issueId));

        String oldStatus = issue.getStatus();
        issue.setStatus(newStatus.toUpperCase());

        if ("RESOLVED".equalsIgnoreCase(newStatus) && !"RESOLVED".equalsIgnoreCase(oldStatus)) {
            issue.setResolvedAt(LocalDateTime.now());

            // Award reward points to reporting user
            if (issue.getReportedBy() != null && !issue.getReportedBy().trim().isEmpty()) {
                Optional<User> reporterOpt = userRepository.findByEmailIgnoreCase(issue.getReportedBy().trim());
                if (reporterOpt.isPresent()) {
                    User reporter = reporterOpt.get();
                    reporter.setPoints((reporter.getPoints() != null ? reporter.getPoints() : 0) + 100);
                    reporter.setIssuesResolved((reporter.getIssuesResolved() != null ? reporter.getIssuesResolved() : 0) + 1);
                    userRepository.save(reporter);
                }
            }
        }

        return issueRepository.save(issue);
    }

    /**
     * BUSINESS RULE 3: One-time Upvote per citizen and Re-calculate Priority
     * Stores vote in issue_votes table and prevents duplicate votes.
     * Awards +10 civic points for participation.
     */
    @Transactional
    public CivicIssue upvoteIssue(Long issueId, String voterEmail, String voterAadhaar) {
        CivicIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found with ID: " + issueId));

        String email = (voterEmail != null && !voterEmail.trim().isEmpty())
                ? voterEmail.trim().toLowerCase()
                : "anonymous@civicecho.org";

        // Prevent duplicate voting: only one time user can vote on a particular issue
        if (issueVoteRepository.existsByIssueIdAndVoterEmail(issueId, email)) {
            throw new IllegalStateException("You have already voted on this issue. Citizens may only vote once per issue.");
        }

        // Record vote in database
        IssueVote vote = new IssueVote(issueId, email, voterAadhaar);
        issueVoteRepository.save(vote);

        // Update issue cluster count and recalculate priority
        issue.setClusterCount(issue.getClusterCount() + 1);
        Double newScore = calculatePriorityScore(issue.getUrgency(), issue.getClusterCount(), issue.getSentimentScore());
        issue.setPriorityScore(newScore);

        // Award +10 Civic Points to the voting citizen for civic participation
        if (!"anonymous@civicecho.org".equalsIgnoreCase(email)) {
            userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
                user.setPoints((user.getPoints() != null ? user.getPoints() : 0) + 10);
                userRepository.save(user);
            });
        }

        return issueRepository.save(issue);
    }

    public List<Long> getVotedIssueIds(String voterEmail) {
        if (voterEmail == null || voterEmail.trim().isEmpty()) {
            return List.of();
        }
        return issueVoteRepository.findByVoterEmailIgnoreCase(voterEmail.trim().toLowerCase())
                .stream()
                .map(IssueVote::getIssueId)
                .toList();
    }
}
