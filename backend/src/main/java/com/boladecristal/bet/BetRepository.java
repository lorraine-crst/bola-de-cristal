package com.boladecristal.bet;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface BetRepository extends JpaRepository<Bet, Long>, JpaSpecificationExecutor<Bet> {

    @Override
    @EntityGraph(attributePaths = { "creator", "resolvedBy" })
    Page<Bet> findAll(Specification<Bet> spec, Pageable pageable);

    @Query("""
            select new com.boladecristal.bet.StatusCount(b.creator.id, b.status, count(b))
            from Bet b
            group by b.creator.id, b.status
            """)
    List<StatusCount> countByCreatorAndStatus();
}
