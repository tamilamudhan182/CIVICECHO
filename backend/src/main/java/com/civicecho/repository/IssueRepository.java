package com.civicecho.repository;

import com.civicecho.model.CivicIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<CivicIssue, Long> {
    List<CivicIssue> findByLocality(String locality);
    List<CivicIssue> findByStatus(String status);
    List<CivicIssue> findByCategory(String category);
    List<CivicIssue> findAllByOrderByPriorityScoreDesc();
}
