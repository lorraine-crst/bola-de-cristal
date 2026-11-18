package com.boladecristal.bet;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
        @NotBlank(message = "Escreva o comentário.")
        @Size(max = 1000, message = "O comentário pode ter no máximo 1000 caracteres.")
        String body) {
}
