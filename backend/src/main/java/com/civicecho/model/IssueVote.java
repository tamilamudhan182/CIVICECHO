package com.civicecho.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "issue_votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"issueId", "voterEmail"})
})
public class IssueVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long issueId;

    @Column(nullable = false)
    private String voterEmail;

    private String voterAadhaar;

    private LocalDateTime votedAt;

    public IssueVote() {
        this.votedAt = LocalDateTime.now();
    }

    public IssueVote(Long issueId, String voterEmail, String voterAadhaar) {
        this();
        this.issueId = issueId;
        this.voterEmail = voterEmail != null ? voterEmail.trim().toLowerCase() : "";
        this.voterAadhaar = voterAadhaar;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIssueId() {
        return issueId;
    }

    public void setIssueId(Long issueId) {
        this.issueId = issueId;
    }

    public String getVoterEmail() {
        return voterEmail;
    }

    public void setVoterEmail(String voterEmail) {
        this.voterEmail = voterEmail != null ? voterEmail.trim().toLowerCase() : "";
    }

    public String getVoterAadhaar() {
        return voterAadhaar;
    }

    public void setVoterAadhaar(String voterAadhaar) {
        this.voterAadhaar = voterAadhaar;
    }

    public LocalDateTime getVotedAt() {
        return votedAt;
    }

    public void setVotedAt(LocalDateTime votedAt) {
        this.votedAt = votedAt;
    }
}
