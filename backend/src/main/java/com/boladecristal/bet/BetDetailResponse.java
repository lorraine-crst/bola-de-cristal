package com.boladecristal.bet;

import java.util.List;

public record BetDetailResponse(BetResponse bet, List<BetEventResponse> history, List<BetCommentResponse> comments) {
}
