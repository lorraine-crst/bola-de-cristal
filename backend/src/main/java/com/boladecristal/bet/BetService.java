package com.boladecristal.bet;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boladecristal.common.ApiException;
import com.boladecristal.common.PageResponse;
import com.boladecristal.security.CurrentUser;
import com.boladecristal.user.User;

@Service
public class BetService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Sort NEWEST_FIRST = Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));

    private final BetRepository betRepository;
    private final BetEventRepository betEventRepository;
    private final CurrentUser currentUser;

    public BetService(BetRepository betRepository, BetEventRepository betEventRepository, CurrentUser currentUser) {
        this.betRepository = betRepository;
        this.betEventRepository = betEventRepository;
        this.currentUser = currentUser;
    }

    @Transactional
    public BetDetailResponse create(BetRequest request) {
        User user = currentUser.get();
        Bet bet = betRepository.save(new Bet(user, request.description(), request.probableYear()));
        betEventRepository.save(BetEvent.created(bet, user));
        return toDetail(bet, user);
    }

    @Transactional(readOnly = true)
    public PageResponse<BetResponse> search(BetFilter filter, int page, int size) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw ApiException.badRequest("Paginação inválida: page começa em 0 e size vai de 1 a " + MAX_PAGE_SIZE + ".");
        }
        if (filter.createdFrom() != null && filter.createdTo() != null
                && filter.createdFrom().isAfter(filter.createdTo())) {
            throw ApiException.badRequest("A data inicial não pode ser depois da data final.");
        }
        User viewer = currentUser.get();
        Long creatorId = filter.mine() ? viewer.getId() : filter.creatorId();
        Page<BetResponse> result = betRepository
                .findAll(BetSpecifications.matching(filter, creatorId), PageRequest.of(page, size, NEWEST_FIRST))
                .map(bet -> BetResponse.from(bet, viewer));
        return PageResponse.from(result);
    }

    @Transactional(readOnly = true)
    public BetDetailResponse findById(Long id) {
        return toDetail(findBet(id), currentUser.get());
    }

    @Transactional
    public BetDetailResponse update(Long id, BetRequest request) {
        User user = currentUser.get();
        Bet bet = findBet(id);
        String previousDescription = bet.getDescription();
        Integer previousProbableYear = bet.getProbableYear();
        if (bet.edit(user, request.description(), request.probableYear())) {
            betEventRepository.save(BetEvent.edited(bet, user, previousDescription, previousProbableYear));
        }
        return toDetail(bet, user);
    }

    @Transactional
    public BetDetailResponse accept(Long id, AcceptBetRequest request) {
        User user = currentUser.get();
        Bet bet = findBet(id);
        bet.accept(user, request.comment(), request.occurredDate(), request.occurredYear());
        betEventRepository.save(BetEvent.accepted(bet, user));
        return toDetail(bet, user);
    }

    @Transactional
    public BetDetailResponse deny(Long id, DenyBetRequest request) {
        User user = currentUser.get();
        Bet bet = findBet(id);
        bet.deny(user, request.comment());
        betEventRepository.save(BetEvent.denied(bet, user));
        return toDetail(bet, user);
    }

    private Bet findBet(Long id) {
        return betRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Aposta não encontrada."));
    }

    private BetDetailResponse toDetail(Bet bet, User viewer) {
        List<BetEventResponse> history = betEventRepository.findByBetIdOrderByCreatedAtAscIdAsc(bet.getId())
                .stream()
                .map(BetEventResponse::from)
                .toList();
        return new BetDetailResponse(BetResponse.from(bet, viewer), history);
    }
}
