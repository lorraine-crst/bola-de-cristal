package com.boladecristal.auth;

import com.boladecristal.user.UserResponse;

public record LoginResponse(String token, UserResponse user) {
}
