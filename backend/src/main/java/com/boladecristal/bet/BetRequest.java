package com.boladecristal.bet;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BetRequest(
        @NotBlank(message = "O título é obrigatório.")
        @Size(max = 120, message = "O título pode ter no máximo 120 caracteres.")
        String title,

        BetType type,

        @Size(max = 2000, message = "A descrição pode ter no máximo 2000 caracteres.")
        String description,

        Integer probableYear,

        @Size(max = 2000, message = "O palpite pode ter no máximo 2000 caracteres.")
        String prediction) {
}
