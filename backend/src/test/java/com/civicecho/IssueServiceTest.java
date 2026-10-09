package com.civicecho;

import com.civicecho.model.CivicIssue;
import com.civicecho.model.User;
import com.civicecho.repository.IssueRepository;
import com.civicecho.repository.UserRepository;
import com.civicecho.service.IssueService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class IssueServiceTest {

    @Mock
    private IssueRepository issueRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private IssueService issueService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Business Rule 1: Priority score calculation for CRITICAL urgency with upvotes")
    public void testCalculatePriorityScore_CriticalUrgency() {
        // Urgency CRITICAL (40) + 5 clusters * 5 (25) + abs(-0.8) * 10 (8) = 73.0
        Double priorityScore = issueService.calculatePriorityScore("CRITICAL", 5, -0.8);
        assertEquals(73.0, priorityScore, 0.01, "Priority score should equal 73.0 for CRITICAL urgency with 5 clusters");
    }

    @Test
    @DisplayName("Business Rule 1: Priority score calculation for LOW urgency")
    public void testCalculatePriorityScore_LowUrgency() {
        // Urgency LOW (10) + 1 cluster * 5 (5) + abs(-0.2) * 10 (2) = 17.0
        Double priorityScore = issueService.calculatePriorityScore("LOW", 1, -0.2);
        assertEquals(17.0, priorityScore, 0.01, "Priority score should equal 17.0 for LOW urgency");
    }

    @Test
    @DisplayName("Business Rule 2: Resolving an issue awards 100 civic points to reporting user")
    public void testUpdateIssueStatus_ResolvesAndAwardsPoints() {
        // Given
        Long issueId = 1L;
        String reporterEmail = "testuser@civicecho.org";

        CivicIssue issue = new CivicIssue("Pothole on Main St", "Deep pothole", "infrastructure", "HIGH", "Main St", "Koramangala", reporterEmail);
        issue.setId(issueId);
        issue.setStatus("PENDING");

        User user = new User("Test Citizen", reporterEmail, "1234", "Koramangala", "Bengaluru Urban", "Karnataka");
        user.setPoints(100);
        user.setIssuesResolved(0);

        when(issueRepository.findById(issueId)).thenReturn(Optional.of(issue));
        when(userRepository.findByEmail(reporterEmail)).thenReturn(Optional.of(user));
        when(issueRepository.save(any(CivicIssue.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        CivicIssue resolvedIssue = issueService.updateIssueStatus(issueId, "RESOLVED");

        // Then
        assertEquals("RESOLVED", resolvedIssue.getStatus(), "Issue status should be updated to RESOLVED");
        assertNotNull(resolvedIssue.getResolvedAt(), "Resolved timestamp should be populated");
        assertEquals(200, user.getPoints(), "User reward points should be incremented by 100 (from 100 to 200)");
        assertEquals(1, user.getIssuesResolved(), "User issuesResolved count should be incremented to 1");

        verify(issueRepository, times(1)).save(issue);
        verify(userRepository, times(1)).save(user);
    }
}
