package com.civicecho.controller;

import com.civicecho.model.CivicIssue;
import com.civicecho.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*")
public class IssueController {

    private final IssueService issueService;

    @Autowired
    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping
    public ResponseEntity<List<CivicIssue>> getAllIssues() {
        return ResponseEntity.ok(issueService.getAllIssues());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CivicIssue> getIssueById(@PathVariable Long id) {
        return issueService.getIssueById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CivicIssue> createIssue(@RequestBody CivicIssue issue) {
        CivicIssue createdIssue = issueService.createIssue(issue);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdIssue);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CivicIssue> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        CivicIssue updatedIssue = issueService.updateIssueStatus(id, status);
        return ResponseEntity.ok(updatedIssue);
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<CivicIssue> upvoteIssue(@PathVariable Long id) {
        CivicIssue upvotedIssue = issueService.upvoteIssue(id);
        return ResponseEntity.ok(upvotedIssue);
    }
}
