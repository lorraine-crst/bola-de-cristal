CREATE TABLE bet_sides (
    id BIGINT NOT NULL AUTO_INCREMENT,
    bet_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    prediction VARCHAR(2000) NOT NULL,
    correct BOOLEAN NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_bet_sides_bet FOREIGN KEY (bet_id) REFERENCES bets (id),
    CONSTRAINT fk_bet_sides_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_bet_sides_bet_user UNIQUE (bet_id, user_id)
);

ALTER TABLE bet_events ADD COLUMN previous_title VARCHAR(120) NULL AFTER comment;

ALTER TABLE bet_events DROP CHECK ck_bet_events_action;

ALTER TABLE bet_events ADD CONSTRAINT ck_bet_events_action
    CHECK (action IN ('CREATED', 'EDITED', 'ACCEPTED', 'DENIED', 'SIDE_FILLED', 'FINISHED'));