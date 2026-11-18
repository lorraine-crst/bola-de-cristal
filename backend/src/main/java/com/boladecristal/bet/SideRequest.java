package com.boladecristal.bet;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SideRequest(
        @NotBlank(message = "Escreva o seu palpite.")
        @Size(max = 2000, message = "O palpite pode ter no máximo 2000 caracteres.")
        String prediction) {
}
