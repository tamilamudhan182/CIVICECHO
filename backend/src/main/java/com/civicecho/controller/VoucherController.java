package com.civicecho.controller;

import com.civicecho.model.RedeemedVoucher;
import com.civicecho.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vouchers")
@CrossOrigin(origins = "*")
public class VoucherController {

    private final VoucherService voucherService;

    @Autowired
    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping
    public ResponseEntity<List<RedeemedVoucher>> getVouchers(@RequestParam(required = false) String email) {
        return ResponseEntity.ok(voucherService.getUserVouchers(email));
    }

    @PostMapping("/redeem")
    public ResponseEntity<?> redeemVoucher(@RequestBody RedeemedVoucher voucher) {
        try {
            RedeemedVoucher saved = voucherService.redeemVoucher(voucher);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
