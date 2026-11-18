package com.boladecristal.bet;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bets")
public class BetController {

    private final BetService betService;

    public BetController(BetService betService) {
        this.betService = betService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BetDetailResponse create(@Valid @RequestBody BetRequest request) {
        return betService.create(request);
    }

    @GetMapping("/{id}")
    public BetDetailResponse findById(@PathVariable Long id) {
        return betService.findById(id);
    }

    @PutMapping("/{id}")
    public BetDetailResponse update(@PathVariable Long id, @Valid @RequestBody BetRequest request) {
        return betService.update(id, request);
    }

    @PostMapping("/{id}/accept")
    public BetDetailResponse accept(@PathVariable Long id, @Valid @RequestBody AcceptBetRequest request) {
        return betService.accept(id, request);
    }

    @PostMapping("/{id}/deny")
    public BetDetailResponse deny(@PathVariable Long id, @Valid @RequestBody DenyBetRequest request) {
        return betService.deny(id, request);
    }
}
