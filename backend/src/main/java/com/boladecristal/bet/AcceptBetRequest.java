package com.boladecristal.bet;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AcceptBetRequest(
        @NotBlank(message = "O comentário de confirmação é obrigatório.")
        @Size(max = 2000, message = "O comentário pode ter no máximo 2000 caracteres.")
        String comment,

        LocalDate occurredDate,

        Integer occurredYear) {
}
