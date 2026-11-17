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
    public ResponseEntity<?> upvoteIssue(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(required = false) String email
    ) {
        String voterEmail = email;
        String voterAadhaar = null;
        if (body != null) {
            if (body.containsKey("email") && (voterEmail == null || voterEmail.isEmpty())) {
                voterEmail = body.get("email");
            }
            if (body.containsKey("voterEmail") && (voterEmail == null || voterEmail.isEmpty())) {
                voterEmail = body.get("voterEmail");
            }
            if (body.containsKey("aadhaar")) {
                voterAadhaar = body.get("aadhaar");
            }
        }

        try {
            CivicIssue upvotedIssue = issueService.upvoteIssue(id, voterEmail, voterAadhaar);
            return ResponseEntity.ok(upvotedIssue);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/voted")
    public ResponseEntity<List<Long>> getVotedIssueIds(@RequestParam String email) {
        return ResponseEntity.ok(issueService.getVotedIssueIds(email));
    }
}
