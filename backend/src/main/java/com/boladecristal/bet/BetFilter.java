package com.boladecristal.bet;

import java.time.LocalDate;

public record BetFilter(
        BetStatus status,
        Long creatorId,
        Integer probableYear,
        String q,
        LocalDate createdFrom,
        LocalDate createdTo,
        boolean mine) {
}
