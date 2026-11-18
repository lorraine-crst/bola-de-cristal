package com.boladecristal.bet;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.Objects;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.boladecristal.common.ApiException;
import com.boladecristal.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "bets")
public class Bet {

    private static final int MAX_TEXT_LENGTH = 2000;
    private static final int MAX_YEARS_AHEAD = 100;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private Integer probableYear;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private BetStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(length = 2000)
    private String resolutionComment;

    private LocalDate occurredDate;

    private Integer occurredYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_id")
    private User resolvedBy;

    private LocalDateTime resolvedAt;

    @Version
    private Long version;

    protected Bet() {
    }

    public Bet(User creator, String description, Integer probableYear) {
        this.creator = creator;
        this.description = requireText(description, "A descrição é obrigatória.");
        this.probableYear = requireValidProbableYear(probableYear);
        this.status = BetStatus.OPEN;
        this.createdAt = LocalDateTime.now();
    }

    public boolean isCreatedBy(User user) {
        return creator.getId().equals(user.getId());
    }

    public boolean isOpen() {
        return status == BetStatus.OPEN;
    }

    public boolean edit(User editor, String newDescription, Integer newProbableYear) {
        if (!isCreatedBy(editor)) {
            throw ApiException.forbidden("Só quem criou a aposta pode editá-la.");
        }
        requireOpen();
        String validDescription = requireText(newDescription, "A descrição é obrigatória.");
        Integer validYear = Objects.equals(newProbableYear, probableYear)
                ? probableYear
                : requireValidProbableYear(newProbableYear);
        if (validDescription.equals(description) && validYear.equals(probableYear)) {
            return false;
        }
        this.description = validDescription;
        this.probableYear = validYear;
        return true;
    }

    public void accept(User resolver, String comment, LocalDate occurredDate, Integer occurredYear) {
        requireResolver(resolver);
        requireOpen();
        String validComment = requireText(comment, "O comentário de confirmação é obrigatório.");
        requireValidOccurrence(occurredDate, occurredYear);
        resolve(BetStatus.ACCEPTED, resolver, validComment);
        this.occurredDate = occurredDate;
        this.occurredYear = occurredYear;
    }

    public void deny(User resolver, String comment) {
        requireResolver(resolver);
        requireOpen();
        String validComment = requireText(comment, "O comentário da negativa é obrigatório.");
        resolve(BetStatus.DENIED, resolver, validComment);
    }

    private void resolve(BetStatus newStatus, User resolver, String comment) {
        this.status = newStatus;
        this.resolvedBy = resolver;
        this.resolutionComment = comment;
        this.resolvedAt = LocalDateTime.now();
    }

    private void requireResolver(User user) {
        if (isCreatedBy(user)) {
            throw ApiException.forbidden("Você não pode validar a sua própria aposta.");
        }
    }

    private void requireOpen() {
        if (!isOpen()) {
            throw ApiException.conflict("Esta aposta já foi validada e não pode mais ser alterada.");
        }
    }

    private void requireValidOccurrence(LocalDate date, Integer year) {
        if ((date == null) == (year == null)) {
            throw ApiException.badRequest("Informe a data ou o ano em que aconteceu, apenas um dos dois.");
        }
        LocalDate today = LocalDate.now();
        LocalDate createdOn = createdAt.toLocalDate();
        if (date != null && date.isAfter(today)) {
            throw ApiException.badRequest("A data em que aconteceu não pode estar no futuro.");
        }
        if (date != null && date.isBefore(createdOn)) {
            throw ApiException.badRequest("A data em que aconteceu não pode ser anterior à criação da aposta.");
        }
        if (year != null && year > today.getYear()) {
            throw ApiException.badRequest("O ano em que aconteceu não pode estar no futuro.");
        }
        if (year != null && year < createdOn.getYear()) {
            throw ApiException.badRequest("O ano em que aconteceu não pode ser anterior à criação da aposta.");
        }
    }

    private static String requireText(String text, String message) {
        if (text == null || text.isBlank()) {
            throw ApiException.badRequest(message);
        }
        String trimmed = text.trim();
        if (trimmed.length() > MAX_TEXT_LENGTH) {
            throw ApiException.badRequest("O texto pode ter no máximo " + MAX_TEXT_LENGTH + " caracteres.");
        }
        return trimmed;
    }

    private static Integer requireValidProbableYear(Integer year) {
        int currentYear = Year.now().getValue();
        int maxYear = currentYear + MAX_YEARS_AHEAD;
        if (year == null || year < currentYear || year > maxYear) {
            throw ApiException.badRequest("O ano provável deve estar entre " + currentYear + " e " + maxYear + ".");
        }
        return year;
    }

    public Long getId() {
        return id;
    }

    public User getCreator() {
        return creator;
    }

    public String getDescription() {
        return description;
    }

    public Integer getProbableYear() {
        return probableYear;
    }

    public BetStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getResolutionComment() {
        return resolutionComment;
    }

    public LocalDate getOccurredDate() {
        return occurredDate;
    }

    public Integer getOccurredYear() {
        return occurredYear;
    }

    public User getResolvedBy() {
        return resolvedBy;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }
}
