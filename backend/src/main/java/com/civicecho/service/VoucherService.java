package com.civicecho.service;

import com.civicecho.model.RedeemedVoucher;
import com.civicecho.model.User;
import com.civicecho.repository.UserRepository;
import com.civicecho.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final UserRepository userRepository;

    @Autowired
    public VoucherService(VoucherRepository voucherRepository, UserRepository userRepository) {
        this.voucherRepository = voucherRepository;
        this.userRepository = userRepository;
    }

    public List<RedeemedVoucher> getUserVouchers(String userEmail) {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            return voucherRepository.findAllByOrderByCreatedAtDesc();
        }
        return voucherRepository.findByUserEmailIgnoreCaseOrderByCreatedAtDesc(userEmail.trim());
    }

    @Transactional
    public RedeemedVoucher redeemVoucher(RedeemedVoucher voucher) {
        String email = voucher.getUserEmail() != null ? voucher.getUserEmail().trim().toLowerCase() : "";
        int cost = voucher.getPointsSpent() != null ? voucher.getPointsSpent() : 0;

        Optional<User> userOpt = Optional.empty();
        if (!email.isEmpty()) {
            userOpt = userRepository.findByEmailIgnoreCase(email);
        }
        if (userOpt.isEmpty() && voucher.getUserAadhaar() != null && !voucher.getUserAadhaar().isEmpty()) {
            userOpt = userRepository.findByAadhaar(voucher.getUserAadhaar());
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            int currentPoints = user.getPoints() != null ? user.getPoints() : 0;
            if (currentPoints < cost) {
                throw new IllegalStateException("Insufficient civic points. Required: " + cost + ", Available: " + currentPoints);
            }
            user.setPoints(currentPoints - cost);
            userRepository.save(user);
        }

        if (voucher.getCreatedAt() == null) {
            voucher.setCreatedAt(LocalDateTime.now());
        }

        return voucherRepository.save(voucher);
    }
}
