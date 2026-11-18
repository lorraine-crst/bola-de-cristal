package com.boladecristal.dashboard;

import java.util.List;

import com.boladecristal.user.UserResponse;

public record DashboardResponse(
        long total,
        long open,
        long accepted,
        long denied,
        List<PersonStats> people,
        SharedStats shared) {

    public record PersonStats(UserResponse user, long total, long open, long accepted, long denied) {
    }

    public record SharedStats(
            long total,
            long open,
            long finished,
            long bothRight,
            long bothWrong,
            List<PersonScore> people) {
    }

    public record PersonScore(UserResponse user, long correct, long onlyOneRight) {
    }
}
