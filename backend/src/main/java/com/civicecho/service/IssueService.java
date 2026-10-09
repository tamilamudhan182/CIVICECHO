package com.civicecho.service;

import com.civicecho.model.CivicIssue;
import com.civicecho.model.User;
import com.civicecho.repository.IssueRepository;
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

    @Autowired
    public IssueService(IssueRepository issueRepository, UserRepository userRepository) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
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

        // Apply Business Rule 1
        Double calculatedScore = calculatePriorityScore(
                issue.getUrgency(), 
                issue.getClusterCount(), 
                issue.getSentimentScore()
        );
        issue.setPriorityScore(calculatedScore);

        // Update reporting user stats if user email provided
        if (issue.getReportedBy() != null && !issue.getReportedBy().isEmpty()) {
            userRepository.findByEmail(issue.getReportedBy()).ifPresent(user -> {
                user.setIssuesReported(user.getIssuesReported() + 1);
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
            if (issue.getReportedBy() != null && !issue.getReportedBy().isEmpty()) {
                Optional<User> reporterOpt = userRepository.findByEmail(issue.getReportedBy());
                if (reporterOpt.isPresent()) {
                    User reporter = reporterOpt.get();
                    reporter.setPoints(reporter.getPoints() + 100); // Award 100 civic points
                    reporter.setIssuesResolved(reporter.getIssuesResolved() + 1);
                    userRepository.save(reporter);
                }
            }
        }

        return issueRepository.save(issue);
    }

    /**
     * BUSINESS RULE 3: Upvote and Re-calculate Priority
     */
    @Transactional
    public CivicIssue upvoteIssue(Long issueId) {
        CivicIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found with ID: " + issueId));

        issue.setClusterCount(issue.getClusterCount() + 1);
        Double newScore = calculatePriorityScore(issue.getUrgency(), issue.getClusterCount(), issue.getSentimentScore());
        issue.setPriorityScore(newScore);

        return issueRepository.save(issue);
    }
}
