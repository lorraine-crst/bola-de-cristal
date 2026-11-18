package com.boladecristal.bet;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BetEventRepository extends JpaRepository<BetEvent, Long> {

    List<BetEvent> findByBetIdOrderByCreatedAtAscIdAsc(Long betId);
}
