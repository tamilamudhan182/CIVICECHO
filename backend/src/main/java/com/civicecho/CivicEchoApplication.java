package com.civicecho;

import com.civicecho.model.CivicIssue;
import com.civicecho.model.User;
import com.civicecho.repository.IssueRepository;
import com.civicecho.repository.UserRepository;
import com.civicecho.service.IssueService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class CivicEchoApplication {

    public static void main(String[] args) {
        SpringApplication.run(CivicEchoApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedDatabase(UserRepository userRepository, IssueRepository issueRepository, IssueService issueService) {
        return args -> {
            // Seed Sample Citizens
            if (userRepository.count() == 0) {
                User u1 = new User("Aarav Sharma", "aarav@civicecho.org", "4521", "Koramangala", "Bengaluru Urban", "Karnataka");
                u1.setPoints(450);
                u1.setIssuesReported(5);
                u1.setIssuesResolved(4);
                userRepository.save(u1);

                User u2 = new User("Priya Patel", "priya@civicecho.org", "8832", "Indiranagar", "Bengaluru Urban", "Karnataka");
                u2.setPoints(320);
                u2.setIssuesReported(3);
                u2.setIssuesResolved(2);
                userRepository.save(u2);

                User u3 = new User("Rohan Verma", "rohan@civicecho.org", "1290", "HSR Layout", "Bengaluru Urban", "Karnataka");
                u3.setPoints(280);
                u3.setIssuesReported(2);
                u3.setIssuesResolved(1);
                userRepository.save(u3);
            }

            // Seed Sample Civic Issues across ALL 5+ Authority Departments
            if (issueRepository.count() == 0) {
                // 1. Health Authority Issue
                CivicIssue issueHealth = new CivicIssue(
                        "Stagnant Mosquito Water Pool Near Primary Health Center",
                        "Stagnant rainwater accumulation causing severe mosquito breeding & dengue hazard.",
                        "health",
                        "CRITICAL",
                        "12th Main, Koramangala",
                        "Koramangala",
                        "aarav@civicecho.org"
                );
                issueHealth.setClusterCount(6);
                issueHealth.setSentimentScore(-0.90);

                // 2. Safety Authority Issue
                CivicIssue issueSafety = new CivicIssue(
                        "Missing Pedestrian Guard Rail at High Traffic Junction",
                        "Guard rail damaged in recent accident, creating severe hazard for school children crossing.",
                        "safety",
                        "HIGH",
                        "Outer Ring Road Junction",
                        "HSR Layout",
                        "rohan@civicecho.org"
                );
                issueSafety.setClusterCount(5);
                issueSafety.setSentimentScore(-0.75);

                // 3. Sanitation Authority Issue
                CivicIssue issueSanitation = new CivicIssue(
                        "Garbage Overflow & Uncollected Waste",
                        "Municipal bins overflowing with household waste for 3 days. Severe stench and health risk.",
                        "sanitation",
                        "HIGH",
                        "Sector 3 Park, HSR Layout",
                        "HSR Layout",
                        "rohan@civicecho.org"
                );
                issueSanitation.setClusterCount(4);
                issueSanitation.setSentimentScore(-0.70);

                // 4. Water Supply Authority Issue
                CivicIssue issueWater = new CivicIssue(
                        "Main Water Pipe Burst & Drinking Water Leakage",
                        "Clean drinking water pipe burst causing water logging and low pressure in residential units.",
                        "water",
                        "CRITICAL",
                        "100ft Road, Indiranagar",
                        "Indiranagar",
                        "priya@civicecho.org"
                );
                issueWater.setClusterCount(7);
                issueWater.setSentimentScore(-0.80);

                // 5. Electricity Authority Issue
                CivicIssue issueElectricity = new CivicIssue(
                        "Flickering Streetlight & Exposed Electrical Wiring",
                        "Streetlight pole off for 3 nights with exposed electrical wires near bus stop.",
                        "electricity",
                        "HIGH",
                        "Indiranagar 100ft Road",
                        "Indiranagar",
                        "priya@civicecho.org"
                );
                issueElectricity.setClusterCount(4);
                issueElectricity.setSentimentScore(-0.65);

                // 6. Infrastructure Authority Issue
                CivicIssue issueInfra = new CivicIssue(
                        "Hazardous Pothole on 80ft Road",
                        "Deep pothole near the school zone causing severe traffic slowdown and potential vehicle damage.",
                        "infrastructure",
                        "CRITICAL",
                        "80 Feet Road, Koramangala",
                        "Koramangala",
                        "aarav@civicecho.org"
                );
                issueInfra.setClusterCount(8);
                issueInfra.setSentimentScore(-0.85);

                issueService.createIssue(issueHealth);
                issueService.createIssue(issueSafety);
                issueService.createIssue(issueSanitation);
                issueService.createIssue(issueWater);
                issueService.createIssue(issueElectricity);
                issueService.createIssue(issueInfra);

                System.out.println("✅ Civic Echo Database seeded with complaints for ALL 6 Authority Departments!");
            }
        };
    }
}
