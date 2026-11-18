package com.boladecristal.bet;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.boladecristal.user.User;
import com.boladecristal.user.UserResponse;

public record BetResponse(
        Long id,
        BetType type,
        UserResponse creator,
        String title,
        String description,
        Integer probableYear,
        BetStatus status,
        LocalDateTime createdAt,
        Resolution resolution,
        List<Side> sides,
        boolean canEdit,
        boolean canResolve,
        boolean canFillSide,
        boolean canFinish,
        boolean canComment) {

    public record Resolution(
            UserResponse resolvedBy,
            String comment,
            LocalDate occurredDate,
            Integer occurredYear,
            LocalDateTime resolvedAt) {
    }

    public record Side(UserResponse user, String prediction, Boolean correct, LocalDateTime createdAt) {

        static Side from(BetSide side) {
            return new Side(UserResponse.from(side.getUser()), side.getPrediction(), side.getCorrect(),
                    side.getCreatedAt());
        }
    }

    public static BetResponse from(Bet bet, User viewer) {
        boolean createdByViewer = bet.isCreatedBy(viewer);
        boolean open = bet.isOpen();
        boolean shared = bet.isShared();
        Resolution resolution = open ? null : new Resolution(
                UserResponse.from(bet.getResolvedBy()),
                bet.getResolutionComment(),
                bet.getOccurredDate(),
                bet.getOccurredYear(),
                bet.getResolvedAt());
        List<Side> sides = shared ? bet.getSides().stream().map(Side::from).toList() : List.of();
        return new BetResponse(
                bet.getId(),
                bet.getType(),
                UserResponse.from(bet.getCreator()),
                bet.getTitle(),
                bet.getDescription(),
                bet.getProbableYear(),
                bet.getStatus(),
                bet.getCreatedAt(),
                resolution,
                sides,
                createdByViewer && open && (!shared || bet.isWaitingForPartner()),
                !shared && !createdByViewer && open,
                shared && open && !bet.hasSideOf(viewer),
                shared && open && !bet.isWaitingForPartner(),
                shared);
    }
}

