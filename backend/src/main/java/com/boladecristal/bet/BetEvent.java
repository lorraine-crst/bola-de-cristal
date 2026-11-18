package com.boladecristal.bet;

import java.time.LocalDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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

@Entity
@Table(name = "bet_events")
public class BetEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bet_id", nullable = false)
    private Bet bet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private BetAction action;

    @Column(length = 2000)
    private String comment;

    @Column(length = 120)
    private String previousTitle;

    @Column(length = 2000)
    private String previousDescription;

    private Integer previousProbableYear;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    protected BetEvent() {
    }

    private BetEvent(Bet bet, User actor, BetAction action, String comment) {
        this.bet = bet;
        this.actor = actor;
        this.action = action;
        this.comment = comment;
        this.createdAt = LocalDateTime.now();
    }

    public static BetEvent created(Bet bet, User actor) {
        return new BetEvent(bet, actor, BetAction.CREATED, null);
    }

    public static BetEvent edited(Bet bet, User actor, String previousTitle, String previousDescription,
            Integer previousProbableYear) {
        BetEvent event = new BetEvent(bet, actor, BetAction.EDITED, null);
        event.previousTitle = previousTitle;
        event.previousDescription = previousDescription;
        event.previousProbableYear = previousProbableYear;
        return event;
    }

    public static BetEvent accepted(Bet bet, User actor) {
        return new BetEvent(bet, actor, BetAction.ACCEPTED, bet.getResolutionComment());
    }

    public static BetEvent denied(Bet bet, User actor) {
        return new BetEvent(bet, actor, BetAction.DENIED, bet.getResolutionComment());
    }

    public static BetEvent sideFilled(Bet bet, User actor, String prediction) {
        return new BetEvent(bet, actor, BetAction.SIDE_FILLED, prediction);
    }

    public static BetEvent finished(Bet bet, User actor) {
        return new BetEvent(bet, actor, BetAction.FINISHED, bet.getResolutionComment());
    }

    public Long getId() {
        return id;
    }

    public Bet getBet() {
        return bet;
    }

    public User getActor() {
        return actor;
    }

    public BetAction getAction() {
        return action;
    }

    public String getComment() {
        return comment;
    }

    public String getPreviousTitle() {
        return previousTitle;
    }

    public String getPreviousDescription() {
        return previousDescription;
    }

    public Integer getPreviousProbableYear() {
        return previousProbableYear;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
