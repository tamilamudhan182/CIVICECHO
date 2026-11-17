package com.civicecho.repository;

import com.civicecho.model.IssueVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueVoteRepository extends JpaRepository<IssueVote, Long> {
    boolean existsByIssueIdAndVoterEmail(Long issueId, String voterEmail);
    List<IssueVote> findByVoterEmailIgnoreCase(String voterEmail);
    List<IssueVote> findByIssueId(Long issueId);
    long countByIssueId(Long issueId);
}
