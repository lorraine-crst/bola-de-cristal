package com.boladecristal.bet;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FinishBetRequest(
        @NotNull(message = "Diga quem acertou (a lista pode ser vazia).")
        List<Long> correctUserIds,

        @Size(max = 2000, message = "O comentário pode ter no máximo 2000 caracteres.")
        String comment) {
}
