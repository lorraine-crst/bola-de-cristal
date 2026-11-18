package com.boladecristal.bet;

import java.time.LocalDateTime;

import com.boladecristal.user.UserResponse;

public record BetCommentResponse(Long id, UserResponse author, String body, LocalDateTime createdAt) {

    public static BetCommentResponse from(BetComment comment) {
        return new BetCommentResponse(
                comment.getId(),
                UserResponse.from(comment.getAuthor()),
                comment.getBody(),
                comment.getCreatedAt());
    }
}
