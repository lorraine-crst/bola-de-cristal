package com.boladecristal.bet;

import java.time.LocalDateTime;

import com.boladecristal.user.UserResponse;

public record BetEventResponse(
        Long id,
        UserResponse actor,
        BetAction action,
        String comment,
        String previousDescription,
        Integer previousProbableYear,
        LocalDateTime createdAt) {

    public static BetEventResponse from(BetEvent event) {
        return new BetEventResponse(
                event.getId(),
                UserResponse.from(event.getActor()),
                event.getAction(),
                event.getComment(),
                event.getPreviousDescription(),
                event.getPreviousProbableYear(),
                event.getCreatedAt());
    }
}
