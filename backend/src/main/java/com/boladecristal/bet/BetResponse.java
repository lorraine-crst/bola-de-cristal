package com.boladecristal.bet;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.boladecristal.user.User;
import com.boladecristal.user.UserResponse;

public record BetResponse(
        Long id,
        UserResponse creator,
        String description,
        Integer probableYear,
        BetStatus status,
        LocalDateTime createdAt,
        Resolution resolution,
        boolean canEdit,
        boolean canResolve) {

    public record Resolution(
            UserResponse resolvedBy,
            String comment,
            LocalDate occurredDate,
            Integer occurredYear,
            LocalDateTime resolvedAt) {
    }

    public static BetResponse from(Bet bet, User viewer) {
        boolean createdByViewer = bet.isCreatedBy(viewer);
        Resolution resolution = bet.isOpen() ? null : new Resolution(
                UserResponse.from(bet.getResolvedBy()),
                bet.getResolutionComment(),
                bet.getOccurredDate(),
                bet.getOccurredYear(),
                bet.getResolvedAt());
        return new BetResponse(
                bet.getId(),
                UserResponse.from(bet.getCreator()),
                bet.getDescription(),
                bet.getProbableYear(),
                bet.getStatus(),
                bet.getCreatedAt(),
                resolution,
                createdByViewer && bet.isOpen(),
                !createdByViewer && bet.isOpen());
    }
}

