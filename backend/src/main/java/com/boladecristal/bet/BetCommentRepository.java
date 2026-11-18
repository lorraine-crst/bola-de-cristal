package com.boladecristal.bet;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BetCommentRepository extends JpaRepository<BetComment, Long> {

    List<BetComment> findByBetIdOrderByCreatedAtAscIdAsc(Long betId);
}
