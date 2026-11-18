package com.boladecristal.dashboard;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boladecristal.bet.BetRepository;
import com.boladecristal.bet.BetStatus;
import com.boladecristal.bet.BetType;
import com.boladecristal.bet.SideResult;
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
        List<User> users = userRepository.findAll(Sort.by("id"));
        List<StatusCount> counts = betRepository.countByCreatorAndStatus(BetType.SINGLE);
        List<DashboardResponse.PersonStats> people = users.stream()
                .map(user -> personStats(user, counts))
                .toList();
        return new DashboardResponse(
                sum(counts, null, null),
                sum(counts, null, BetStatus.OPEN),
                sum(counts, null, BetStatus.ACCEPTED),
                sum(counts, null, BetStatus.DENIED),
                people,
                sharedStats(users));
    }

    private DashboardResponse.SharedStats sharedStats(List<User> users) {
        List<StatusCount> counts = betRepository.countByCreatorAndStatus(BetType.SHARED);
        Map<Long, List<SideResult>> resultsByBet = betRepository.findFinishedSideResults().stream()
                .collect(Collectors.groupingBy(SideResult::betId));
        long bothRight = resultsByBet.values().stream().filter(sides -> correctCount(sides) == sides.size()).count();
        long bothWrong = resultsByBet.values().stream().filter(sides -> correctCount(sides) == 0).count();
        List<DashboardResponse.PersonScore> scores = users.stream()
                .map(user -> personScore(user, resultsByBet))
                .toList();
        return new DashboardResponse.SharedStats(
                sum(counts, null, null),
                sum(counts, null, BetStatus.OPEN),
                sum(counts, null, BetStatus.FINISHED),
                bothRight,
                bothWrong,
                scores);
    }

    private DashboardResponse.PersonScore personScore(User user, Map<Long, List<SideResult>> resultsByBet) {
        long correct = 0;
        long onlyOneRight = 0;
        for (List<SideResult> sides : resultsByBet.values()) {
            boolean userRight = sides.stream()
                    .anyMatch(side -> side.userId().equals(user.getId()) && Boolean.TRUE.equals(side.correct()));
            if (userRight) {
                correct++;
                if (correctCount(sides) == 1) {
                    onlyOneRight++;
                }
            }
        }
        return new DashboardResponse.PersonScore(UserResponse.from(user), correct, onlyOneRight);
    }

    private static long correctCount(List<SideResult> sides) {
        return sides.stream().filter(side -> Boolean.TRUE.equals(side.correct())).count();
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

