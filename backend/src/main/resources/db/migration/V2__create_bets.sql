CREATE TABLE bets (
    id BIGINT NOT NULL AUTO_INCREMENT,
    creator_id BIGINT NOT NULL,
    description VARCHAR(2000) NOT NULL,
    probable_year INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at DATETIME(6) NOT NULL,
    resolution_comment VARCHAR(2000) NULL,
    occurred_date DATE NULL,
    occurred_year INT NULL,
    resolved_by_id BIGINT NULL,
    resolved_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_bets_creator FOREIGN KEY (creator_id) REFERENCES users (id),
    CONSTRAINT fk_bets_resolved_by FOREIGN KEY (resolved_by_id) REFERENCES users (id),
    CONSTRAINT ck_bets_status CHECK (status IN ('OPEN', 'ACCEPTED', 'DENIED')),
    CONSTRAINT ck_bets_resolver_not_creator CHECK (resolved_by_id IS NULL OR resolved_by_id <> creator_id),
    CONSTRAINT ck_bets_resolution CHECK (
        (status = 'OPEN'
            AND resolved_by_id IS NULL AND resolved_at IS NULL AND resolution_comment IS NULL
            AND occurred_date IS NULL AND occurred_year IS NULL)
        OR (status = 'ACCEPTED'
            AND resolved_by_id IS NOT NULL AND resolved_at IS NOT NULL AND resolution_comment IS NOT NULL
            AND (occurred_date IS NOT NULL XOR occurred_year IS NOT NULL))
        OR (status = 'DENIED'
            AND resolved_by_id IS NOT NULL AND resolved_at IS NOT NULL AND resolution_comment IS NOT NULL
            AND occurred_date IS NULL AND occurred_year IS NULL)
    ),
    INDEX idx_bets_status (status),
    INDEX idx_bets_probable_year (probable_year),
    INDEX idx_bets_created_at (created_at)
);