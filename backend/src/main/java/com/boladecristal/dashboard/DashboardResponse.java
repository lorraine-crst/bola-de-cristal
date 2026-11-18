package com.boladecristal.dashboard;

import java.util.List;

import com.boladecristal.user.UserResponse;

public record DashboardResponse(long total, long open, long accepted, long denied, List<PersonStats> people) {

    public record PersonStats(UserResponse user, long total, long open, long accepted, long denied) {
    }
}
