package com.civicecho.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String aadhaarLast4;
    private String locality;
    private String district;
    private String state;
    private Integer points;
    private String avatarInitials;
    private Integer issuesReported;
    private Integer issuesResolved;

    public User() {
        this.points = 100;
        this.issuesReported = 0;
        this.issuesResolved = 0;
    }

    public User(String name, String email, String aadhaarLast4, String locality, String district, String state) {
        this();
        this.name = name;
        this.email = email;
        this.aadhaarLast4 = aadhaarLast4;
        this.locality = locality;
        this.district = district;
        this.state = state;
        this.avatarInitials = computeInitials(name);
    }

    private String computeInitials(String name) {
        if (name == null || name.trim().isEmpty()) return "U";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { 
        this.name = name; 
        this.avatarInitials = computeInitials(name);
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAadhaarLast4() { return aadhaarLast4; }
    public void setAadhaarLast4(String aadhaarLast4) { this.aadhaarLast4 = aadhaarLast4; }

    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public String getAvatarInitials() { return avatarInitials; }
    public void setAvatarInitials(String avatarInitials) { this.avatarInitials = avatarInitials; }

    public Integer getIssuesReported() { return issuesReported; }
    public void setIssuesReported(Integer issuesReported) { this.issuesReported = issuesReported; }

    public Integer getIssuesResolved() { return issuesResolved; }
    public void setIssuesResolved(Integer issuesResolved) { this.issuesResolved = issuesResolved; }
}
