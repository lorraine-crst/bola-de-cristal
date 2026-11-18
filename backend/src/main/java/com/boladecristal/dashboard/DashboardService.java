package com.boladecristal.dashboard;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boladecristal.bet.BetRepository;
import com.boladecristal.bet.BetStatus;
import com.boladecristal.bet.StatusCount;
import com.boladecristal.user.User;
import com.boladecristal.user.UserRepository;
import com.boladecristal.user.UserResponse;

@Service
public class DashboardService {

    private final BetRepository betRepository;
    private final UserRepository userRepository;

    public DashboardService(BetRepository betRepository, UserRepository userRepository) {
        this.betRepository = betRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse summary() {
        List<StatusCount> counts = betRepository.countByCreatorAndStatus();
        List<DashboardResponse.PersonStats> people = userRepository.findAll(Sort.by("id")).stream()
                .map(user -> personStats(user, counts))
                .toList();
        return new DashboardResponse(
                sum(counts, null, null),
                sum(counts, null, BetStatus.OPEN),
                sum(counts, null, BetStatus.ACCEPTED),
                sum(counts, null, BetStatus.DENIED),
                people);
    }

    private DashboardResponse.PersonStats personStats(User user, List<StatusCount> counts) {
        Long id = user.getId();
        return new DashboardResponse.PersonStats(
                UserResponse.from(user),
                sum(counts, id, null),
                sum(counts, id, BetStatus.OPEN),
                sum(counts, id, BetStatus.ACCEPTED),
                sum(counts, id, BetStatus.DENIED));
    }

    private static long sum(List<StatusCount> counts, Long creatorId, BetStatus status) {
        return counts.stream()
                .filter(count -> creatorId == null || count.creatorId().equals(creatorId))
                .filter(count -> status == null || count.status() == status)
                .mapToLong(StatusCount::count)
                .sum();
    }
}
