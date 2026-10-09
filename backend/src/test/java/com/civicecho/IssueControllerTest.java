package com.civicecho;

import com.civicecho.model.CivicIssue;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class IssueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("REST API: GET /api/issues should return list of seeded civic issues")
    public void testGetAllIssuesEndpoint() throws Exception {
        mockMvc.perform(get("/api/issues")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("REST API: POST /api/issues should create new civic issue and calculate priority")
    public void testCreateIssueEndpoint() throws Exception {
        CivicIssue newIssue = new CivicIssue(
                "Water Leakage on Main Street",
                "Clean drinking water pipe burst causing water logging.",
                "water",
                "HIGH",
                "Main Street",
                "Indiranagar",
                "priya@civicecho.org"
        );

        mockMvc.perform(post("/api/issues")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newIssue)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("Water Leakage on Main Street")))
                .andExpect(jsonPath("$.priorityScore", greaterThan(20.0)));
    }
}
