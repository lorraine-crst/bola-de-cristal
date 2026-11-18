package com.boladecristal.config;

import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Cors cors, List<SeedUser> users) {

    public record Jwt(String secret, Duration expiration) {
    }

    public record Cors(String allowedOrigin) {
    }

    public record SeedUser(String username, String displayName, String password, String color) {
    }
}
