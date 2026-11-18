package com.boladecristal.bet;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DenyBetRequest(
        @NotBlank(message = "O comentário da negativa é obrigatório.")
        @Size(max = 2000, message = "O comentário pode ter no máximo 2000 caracteres.")
        String comment) {
}
