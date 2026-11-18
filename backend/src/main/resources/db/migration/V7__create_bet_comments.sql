CREATE TABLE bet_comments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    bet_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    body VARCHAR(1000) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_bet_comments_bet FOREIGN KEY (bet_id) REFERENCES bets (id),
    CONSTRAINT fk_bet_comments_author FOREIGN KEY (author_id) REFERENCES users (id),
    INDEX idx_bet_comments_bet_created (bet_id, created_at)
);