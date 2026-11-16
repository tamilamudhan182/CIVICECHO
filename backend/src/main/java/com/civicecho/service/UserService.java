package com.civicecho.service;

import com.civicecho.model.User;
import com.civicecho.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        List<User> all = userRepository.findAllByOrderByPointsDesc();
        Map<String, User> uniqueMap = new LinkedHashMap<>();
        for (User u : all) {
            String key = (u.getEmail() != null && !u.getEmail().trim().isEmpty())
                    ? u.getEmail().toLowerCase().trim()
                    : (u.getName() != null ? u.getName().toLowerCase().trim() : String.valueOf(u.getId()));
            if (!uniqueMap.containsKey(key)) {
                uniqueMap.put(key, u);
            }
        }
        return new ArrayList<>(uniqueMap.values());
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserByAadhaar(String aadhaar) {
        if (aadhaar == null || aadhaar.trim().isEmpty()) return Optional.empty();
        return userRepository.findByAadhaar(aadhaar.trim());
    }

    public User createUser(User user) {
        // 1. Upsert by Aadhaar if provided
        if (user.getAadhaar() != null && !user.getAadhaar().trim().isEmpty()) {
            Optional<User> existing = userRepository.findByAadhaar(user.getAadhaar().trim());
            if (existing.isPresent()) {
                User u = existing.get();
                if (user.getName() != null) u.setName(user.getName());
                if (user.getEmail() != null) u.setEmail(user.getEmail());
                if (user.getOtp() != null) u.setOtp(user.getOtp());
                if (user.getLocality() != null) u.setLocality(user.getLocality());
                if (user.getDistrict() != null) u.setDistrict(user.getDistrict());
                if (user.getState() != null) u.setState(user.getState());
                u.setAadhaar(user.getAadhaar().trim());
                if (user.getPoints() != null) {
                    u.setPoints(Math.max(u.getPoints() != null ? u.getPoints() : 0, user.getPoints()));
                }
                return userRepository.save(u);
            }
        }

        // 2. Upsert by Email
        if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
            Optional<User> existing = userRepository.findByEmail(user.getEmail().trim());
            if (existing.isPresent()) {
                User u = existing.get();
                if (user.getName() != null) u.setName(user.getName());
                if (user.getAadhaar() != null) u.setAadhaar(user.getAadhaar());
                if (user.getOtp() != null) u.setOtp(user.getOtp());
                if (user.getLocality() != null) u.setLocality(user.getLocality());
                if (user.getDistrict() != null) u.setDistrict(user.getDistrict());
                if (user.getState() != null) u.setState(user.getState());
                u.setAadhaarLast4(user.getAadhaarLast4());
                if (user.getPoints() != null) {
                    u.setPoints(Math.max(u.getPoints() != null ? u.getPoints() : 0, user.getPoints()));
                }
                return userRepository.save(u);
            }
        }

        // 3. Secondary Upsert check by Name
        if (user.getName() != null && !user.getName().trim().isEmpty()) {
            List<User> all = userRepository.findAll();
            for (User u : all) {
                if (u.getName() != null && u.getName().trim().equalsIgnoreCase(user.getName().trim())) {
                    if (user.getAadhaar() != null) u.setAadhaar(user.getAadhaar());
                    if (user.getOtp() != null) u.setOtp(user.getOtp());
                    u.setLocality(user.getLocality());
                    u.setDistrict(user.getDistrict());
                    u.setState(user.getState());
                    u.setAadhaarLast4(user.getAadhaarLast4());
                    if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
                        u.setEmail(user.getEmail());
                    }
                    if (user.getPoints() != null) {
                        u.setPoints(Math.max(u.getPoints() != null ? u.getPoints() : 0, user.getPoints()));
                    }
                    return userRepository.save(u);
                }
            }
        }

        return userRepository.save(user);
    }
}
