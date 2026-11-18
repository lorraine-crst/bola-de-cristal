CREATE TABLE bet_events (
    id BIGINT NOT NULL AUTO_INCREMENT,
    bet_id BIGINT NOT NULL,
    actor_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    comment VARCHAR(2000) NULL,
    previous_description VARCHAR(2000) NULL,
    previous_probable_year INT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_bet_events_bet FOREIGN KEY (bet_id) REFERENCES bets (id),
    CONSTRAINT fk_bet_events_actor FOREIGN KEY (actor_id) REFERENCES users (id),
    CONSTRAINT ck_bet_events_action CHECK (action IN ('CREATED', 'EDITED', 'ACCEPTED', 'DENIED'))
);