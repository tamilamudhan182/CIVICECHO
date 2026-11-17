package com.civicecho.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "redeemed_vouchers")
public class RedeemedVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String voucherCode;

    private String partnerId;
    private String name;
    private String partnerBrand;
    private String category;
    private String icon;
    private String discountValue;
    private Integer pointsSpent;
    private String redeemedDate;
    private String expiryDate;
    private Integer validityDays;

    @Column(length = 2500)
    private String rules;

    @Column(length = 2500)
    private String howItWorks;

    private String userEmail;
    private String userAadhaar;
    private LocalDateTime createdAt;

    public RedeemedVoucher() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVoucherCode() {
        return voucherCode;
    }

    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }

    public String getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(String partnerId) {
        this.partnerId = partnerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPartnerBrand() {
        return partnerBrand;
    }

    public void setPartnerBrand(String partnerBrand) {
        this.partnerBrand = partnerBrand;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(String discountValue) {
        this.discountValue = discountValue;
    }

    public Integer getPointsSpent() {
        return pointsSpent;
    }

    public void setPointsSpent(Integer pointsSpent) {
        this.pointsSpent = pointsSpent;
    }

    public String getRedeemedDate() {
        return redeemedDate;
    }

    public void setRedeemedDate(String redeemedDate) {
        this.redeemedDate = redeemedDate;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Integer getValidityDays() {
        return validityDays;
    }

    public void setValidityDays(Integer validityDays) {
        this.validityDays = validityDays;
    }

    public String getRules() {
        return rules;
    }

    public void setRules(String rules) {
        this.rules = rules;
    }

    public String getHowItWorks() {
        return howItWorks;
    }

    public void setHowItWorks(String howItWorks) {
        this.howItWorks = howItWorks;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail != null ? userEmail.trim().toLowerCase() : "";
    }

    public String getUserAadhaar() {
        return userAadhaar;
    }

    public void setUserAadhaar(String userAadhaar) {
        this.userAadhaar = userAadhaar;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
