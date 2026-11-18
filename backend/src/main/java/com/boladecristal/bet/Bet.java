package com.boladecristal.bet;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.boladecristal.common.ApiException;
import com.boladecristal.user.User;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "bets")
public class Bet {

    private static final int MAX_TEXT_LENGTH = 2000;
    private static final int MAX_TITLE_LENGTH = 120;
    private static final int MAX_YEARS_AHEAD = 100;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false, length = 120)
    private String title;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private BetType type;

    @Column(length = 2000)
    private String description;

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

    @OneToMany(mappedBy = "bet", cascade = CascadeType.PERSIST)
    @OrderBy("createdAt ASC, id ASC")
    @BatchSize(size = 50)
    private List<BetSide> sides = new ArrayList<>();

    protected Bet() {
    }

    private Bet(User creator, BetType type, String title, String description, Integer probableYear) {
        this.creator = creator;
        this.type = type;
        this.title = requireTitle(title);
        this.description = description;
        this.probableYear = probableYear;
        this.status = BetStatus.OPEN;
        this.createdAt = LocalDateTime.now();
    }

    public static Bet single(User creator, String title, String description, Integer probableYear) {
        return new Bet(
                creator,
                BetType.SINGLE,
                title,
                requireText(description, "description", "A descrição é obrigatória."),
                requireValidProbableYear(probableYear));
    }

    public static Bet shared(User creator, String title, String description, String prediction) {
        String validPrediction = requireText(prediction, "prediction", "Escreva o seu palpite.");
        Bet bet = new Bet(creator, BetType.SHARED, title, optionalText(description, "description"), null);
        bet.sides.add(new BetSide(bet, creator, validPrediction));
        return bet;
    }

    public boolean isCreatedBy(User user) {
        return creator.getId().equals(user.getId());
    }

    public boolean isOpen() {
        return status == BetStatus.OPEN;
    }

    public boolean isShared() {
        return type == BetType.SHARED;
    }

    public boolean hasSideOf(User user) {
        return sides.stream().anyMatch(side -> side.belongsTo(user));
    }

    public boolean isWaitingForPartner() {
        return isShared() && sides.size() < 2;
    }

    public boolean edit(User editor, String newTitle, String newDescription, Integer newProbableYear) {
        if (!isCreatedBy(editor)) {
            throw ApiException.forbidden("Só quem criou a aposta pode editá-la.");
        }
        requireOpen();
        if (isShared() && !isWaitingForPartner()) {
            throw ApiException.conflict("A outra pessoa já deu o palpite, então a aposta não pode mais ser editada.");
        }
        String validTitle = requireTitle(newTitle);
        String validDescription;
        Integer validYear;
        if (isShared()) {
            validDescription = optionalText(newDescription, "description");
            validYear = null;
        } else {
            validDescription = requireText(newDescription, "description", "A descrição é obrigatória.");
            validYear = Objects.equals(newProbableYear, probableYear)
                    ? probableYear
                    : requireValidProbableYear(newProbableYear);
        }
        if (validTitle.equals(title)
                && Objects.equals(validDescription, description)
                && Objects.equals(validYear, probableYear)) {
            return false;
        }
        this.title = validTitle;
        this.description = validDescription;
        this.probableYear = validYear;
        return true;
    }

    public void accept(User resolver, String comment, LocalDate occurredDate, Integer occurredYear) {
        requireSingle();
        requireResolver(resolver);
        requireOpen();
        String validComment = requireText(comment, "comment", "O comentário de confirmação é obrigatório.");
        requireValidOccurrence(occurredDate, occurredYear);
        resolve(BetStatus.ACCEPTED, resolver, validComment);
        this.occurredDate = occurredDate;
        this.occurredYear = occurredYear;
    }

    public void deny(User resolver, String comment) {
        requireSingle();
        requireResolver(resolver);
        requireOpen();
        String validComment = requireText(comment, "comment", "O comentário da negativa é obrigatório.");
        resolve(BetStatus.DENIED, resolver, validComment);
    }

    public BetSide fillSide(User user, String prediction) {
        requireShared();
        requireOpen();
        if (hasSideOf(user)) {
            throw ApiException.conflict("Você já deu o seu palpite nesta aposta.");
        }
        BetSide side = new BetSide(this, user, requireText(prediction, "prediction", "Escreva o seu palpite."));
        sides.add(side);
        return side;
    }

    public void finish(User user, Collection<Long> correctUserIds, String comment) {
        requireShared();
        requireOpen();
        if (isWaitingForPartner()) {
            throw ApiException.conflict("Os dois precisam dar o palpite antes de finalizar.");
        }
        Set<Long> correct = correctUserIds == null
                ? Set.of()
                : correctUserIds.stream().filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> participants = sides.stream().map(side -> side.getUser().getId()).collect(Collectors.toSet());
        if (!participants.containsAll(correct)) {
            throw ApiException.badRequest("correctUserIds", "Só quem participou da aposta pode ter acertado.");
        }
        String validComment = optionalText(comment, "comment");
        sides.forEach(side -> side.markCorrect(correct.contains(side.getUser().getId())));
        resolve(BetStatus.FINISHED, user, validComment);
    }

    private void resolve(BetStatus newStatus, User resolver, String comment) {
        this.status = newStatus;
        this.resolvedBy = resolver;
        this.resolutionComment = comment;
        this.resolvedAt = LocalDateTime.now();
    }

    private void requireSingle() {
        if (isShared()) {
            throw ApiException.conflict("Aposta compartilhada não é aceita nem negada: ela é finalizada.");
        }
    }

    private void requireShared() {
        if (!isShared()) {
            throw ApiException.conflict("Só apostas compartilhadas têm palpites dos dois lados.");
        }
    }

    private void requireResolver(User user) {
        if (isCreatedBy(user)) {
            throw ApiException.forbidden("Você não pode validar a sua própria aposta.");
        }
    }

    private void requireOpen() {
        if (!isOpen()) {
            throw ApiException.conflict("Esta aposta já foi encerrada e não pode mais ser alterada.");
        }
    }

    private void requireValidOccurrence(LocalDate date, Integer year) {
        if ((date == null) == (year == null)) {
            throw ApiException.badRequest("Informe a data ou o ano em que aconteceu, apenas um dos dois.");
        }
        LocalDate today = LocalDate.now();
        LocalDate createdOn = createdAt.toLocalDate();
        if (date != null && date.isAfter(today)) {
            throw ApiException.badRequest("occurredDate", "A data em que aconteceu não pode estar no futuro.");
        }
        if (date != null && date.isBefore(createdOn)) {
            throw ApiException.badRequest("occurredDate", "A data em que aconteceu não pode ser anterior à criação da aposta.");
        }
        if (year != null && year > today.getYear()) {
            throw ApiException.badRequest("occurredYear", "O ano em que aconteceu não pode estar no futuro.");
        }
        if (year != null && year < createdOn.getYear()) {
            throw ApiException.badRequest("occurredYear", "O ano em que aconteceu não pode ser anterior à criação da aposta.");
        }
    }

    private static String requireTitle(String title) {
        if (title == null || title.isBlank()) {
            throw ApiException.badRequest("title", "O título é obrigatório.");
        }
        String trimmed = title.trim();
        if (trimmed.length() > MAX_TITLE_LENGTH) {
            throw ApiException.badRequest("title", "O título pode ter no máximo " + MAX_TITLE_LENGTH + " caracteres.");
        }
        return trimmed;
    }

    private static String requireText(String text, String field, String message) {
        String value = optionalText(text, field);
        if (value == null) {
            throw ApiException.badRequest(field, message);
        }
        return value;
    }

    private static String optionalText(String text, String field) {
        if (text == null || text.isBlank()) {
            return null;
        }
        String trimmed = text.trim();
        if (trimmed.length() > MAX_TEXT_LENGTH) {
            throw ApiException.badRequest(field, "O texto pode ter no máximo " + MAX_TEXT_LENGTH + " caracteres.");
        }
        return trimmed;
    }

    private static Integer requireValidProbableYear(Integer year) {
        int currentYear = Year.now().getValue();
        int maxYear = currentYear + MAX_YEARS_AHEAD;
        if (year == null || year < currentYear || year > maxYear) {
            throw ApiException.badRequest("probableYear",
                    "O ano provável deve estar entre " + currentYear + " e " + maxYear + ".");
        }
        return year;
    }

    public Long getId() {
        return id;
    }

    public User getCreator() {
        return creator;
    }

    public String getTitle() {
        return title;
    }

    public BetType getType() {
        return type;
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

    public List<BetSide> getSides() {
        return List.copyOf(sides);
    }
}
