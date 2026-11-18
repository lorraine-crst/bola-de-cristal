package com.boladecristal.user;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.boladecristal.config.AppProperties;

@Component
public class UserSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties properties;

    public UserSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder, AppProperties properties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            return;
        }
        for (AppProperties.SeedUser seed : properties.users()) {
            if (seed.password() == null || seed.password().isBlank()) {
                throw new IllegalStateException("Senha não definida para o usuário " + seed.username());
            }
            userRepository.save(new User(
                    seed.username(),
                    seed.displayName(),
                    passwordEncoder.encode(seed.password()),
                    seed.color()));
        }
    }
}
