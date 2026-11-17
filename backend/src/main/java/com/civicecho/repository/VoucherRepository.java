package com.civicecho.repository;

import com.civicecho.model.RedeemedVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherRepository extends JpaRepository<RedeemedVoucher, Long> {
    List<RedeemedVoucher> findByUserEmailIgnoreCaseOrderByCreatedAtDesc(String userEmail);
    List<RedeemedVoucher> findAllByOrderByCreatedAtDesc();
}

