package com.civicecho.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "civic_issues")
public class CivicIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String description;

    private String category;
    private String status; // PENDING, IN_PROGRESS, RESOLVED
    private String urgency; // LOW, MEDIUM, HIGH, CRITICAL
    private Double sentimentScore;
    private String location;
    private String locality;
    private String reportedBy;
    private LocalDateTime reportedAt;
    private LocalDateTime resolvedAt;
    private Integer clusterCount;
    private Double priorityScore;
    private String imageUrl;

    public CivicIssue() {
        this.reportedAt = LocalDateTime.now();
        this.status = "PENDING";
        this.urgency = "MEDIUM";
        this.clusterCount = 1;
        this.sentimentScore = -0.5;
        this.priorityScore = 10.0;
    }

    public CivicIssue(String title, String description, String category, String urgency, String location, String locality, String reportedBy) {
        this();
        this.title = title;
        this.description = description;
        this.category = category;
        this.urgency = urgency;
        this.location = location;
        this.locality = locality;
        this.reportedBy = reportedBy;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public Double getSentimentScore() { return sentimentScore; }
    public void setSentimentScore(Double sentimentScore) { this.sentimentScore = sentimentScore; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }

    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }

    public LocalDateTime getReportedAt() { return reportedAt; }
    public void setReportedAt(LocalDateTime reportedAt) { this.reportedAt = reportedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public Integer getClusterCount() { return clusterCount; }
    public void setClusterCount(Integer clusterCount) { this.clusterCount = clusterCount; }

    public Double getPriorityScore() { return priorityScore; }
    public void setPriorityScore(Double priorityScore) { this.priorityScore = priorityScore; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
