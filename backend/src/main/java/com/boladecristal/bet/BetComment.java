package com.boladecristal.bet;

import java.time.LocalDateTime;

import com.boladecristal.common.ApiException;
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
@Table(name = "bet_comments")
public class BetComment {

    private static final int MAX_LENGTH = 1000;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bet_id", nullable = false)
    private Bet bet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 1000)
    private String body;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    protected BetComment() {
    }

    public BetComment(Bet bet, User author, String body) {
        if (!bet.isShared()) {
            throw ApiException.conflict("Comentários abertos existem só nas apostas compartilhadas.");
        }
        if (body == null || body.isBlank()) {
            throw ApiException.badRequest("body", "Escreva o comentário.");
        }
        String trimmed = body.trim();
        if (trimmed.length() > MAX_LENGTH) {
            throw ApiException.badRequest("body", "O comentário pode ter no máximo " + MAX_LENGTH + " caracteres.");
        }
        this.bet = bet;
        this.author = author;
        this.body = trimmed;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Bet getBet() {
        return bet;
    }

    public User getAuthor() {
        return author;
    }

    public String getBody() {
        return body;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
