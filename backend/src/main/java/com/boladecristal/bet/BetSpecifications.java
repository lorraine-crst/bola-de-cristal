package com.boladecristal.bet;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

final class BetSpecifications {

    private static final char LIKE_ESCAPE = '!';

    private BetSpecifications() {
    }

    static Specification<Bet> matching(BetFilter filter, Long creatorId) {
        Specification<Bet> spec = Specification.unrestricted();
        if (filter.type() != null) {
            spec = spec.and(hasType(filter.type()));
        }
        if (filter.status() != null) {
            spec = spec.and(hasStatus(filter.status()));
        }
        if (creatorId != null) {
            spec = spec.and(createdBy(creatorId));
        }
        if (filter.probableYear() != null) {
            spec = spec.and(hasProbableYear(filter.probableYear()));
        }
        if (filter.q() != null && !filter.q().isBlank()) {
            spec = spec.and(descriptionContains(filter.q().trim()));
        }
        if (filter.createdFrom() != null) {
            spec = spec.and(createdOnOrAfter(filter.createdFrom()));
        }
        if (filter.createdTo() != null) {
            spec = spec.and(createdOnOrBefore(filter.createdTo()));
        }
        return spec;
    }

    private static Specification<Bet> hasType(BetType type) {
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    private static Specification<Bet> hasStatus(BetStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    private static Specification<Bet> createdBy(Long creatorId) {
        return (root, query, cb) -> cb.equal(root.get("creator").get("id"), creatorId);
    }

    private static Specification<Bet> hasProbableYear(Integer year) {
        return (root, query, cb) -> cb.equal(root.get("probableYear"), year);
    }

    private static Specification<Bet> descriptionContains(String text) {
        String escaped = text
                .replace("!", "!!")
                .replace("%", "!%")
                .replace("_", "!_");
        String pattern = "%" + escaped + "%";
        return (root, query, cb) -> cb.or(
                cb.like(root.get("title"), pattern, LIKE_ESCAPE),
                cb.like(root.get("description"), pattern, LIKE_ESCAPE));
    }

    private static Specification<Bet> createdOnOrAfter(LocalDate date) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), date.atStartOfDay());
    }

    private static Specification<Bet> createdOnOrBefore(LocalDate date) {
        return (root, query, cb) -> cb.lessThan(root.get("createdAt"), date.plusDays(1).atStartOfDay());
    }
}
