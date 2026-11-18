package com.boladecristal.bet;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BetRequest(
        @NotBlank(message = "A descrição é obrigatória.")
        @Size(max = 2000, message = "A descrição pode ter no máximo 2000 caracteres.")
        String description,

        @NotNull(message = "O ano provável é obrigatório.")
        Integer probableYear) {
}
