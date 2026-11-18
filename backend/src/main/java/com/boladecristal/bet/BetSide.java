package com.boladecristal.bet;

import java.time.LocalDateTime;

import com.boladecristal.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "bet_sides")
public class BetSide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bet_id", nullable = false)
    private Bet bet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 2000)
    private String prediction;

    private Boolean correct;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    protected BetSide() {
    }

    BetSide(Bet bet, User user, String prediction) {
        this.bet = bet;
        this.user = user;
        this.prediction = prediction;
        this.createdAt = LocalDateTime.now();
    }

    boolean belongsTo(User other) {
        return user.getId().equals(other.getId());
    }

    void markCorrect(boolean value) {
        this.correct = value;
    }

    public Long getId() {
        return id;
    }

    public Bet getBet() {
        return bet;
    }

    public User getUser() {
        return user;
    }

    public String getPrediction() {
        return prediction;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
