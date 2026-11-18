ALTER TABLE bets
    ADD COLUMN title VARCHAR(120) NULL AFTER creator_id,
    ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'SINGLE' AFTER title;

UPDATE bets SET title = LEFT(description, 120);

ALTER TABLE bets DROP CHECK ck_bets_status;
ALTER TABLE bets DROP CHECK ck_bets_resolution;
ALTER TABLE bets DROP CHECK ck_bets_resolver_not_creator;

ALTER TABLE bets
    MODIFY COLUMN title VARCHAR(120) NOT NULL,
    MODIFY COLUMN description VARCHAR(2000) NULL,
    MODIFY COLUMN probable_year INT NULL;

ALTER TABLE bets
    ADD CONSTRAINT ck_bets_type CHECK (type IN ('SINGLE', 'SHARED')),
    ADD CONSTRAINT ck_bets_status CHECK (status IN ('OPEN', 'ACCEPTED', 'DENIED', 'FINISHED')),
    ADD CONSTRAINT ck_bets_single_fields CHECK (
        type = 'SHARED' OR (description IS NOT NULL AND probable_year IS NOT NULL)
    ),
    ADD CONSTRAINT ck_bets_resolver_not_creator CHECK (
        type = 'SHARED' OR resolved_by_id IS NULL OR resolved_by_id <> creator_id
    ),
    ADD CONSTRAINT ck_bets_resolution CHECK (
        (status = 'OPEN'
            AND resolved_by_id IS NULL AND resolved_at IS NULL AND resolution_comment IS NULL
            AND occurred_date IS NULL AND occurred_year IS NULL)
        OR (type = 'SINGLE' AND status = 'ACCEPTED'
            AND resolved_by_id IS NOT NULL AND resolved_at IS NOT NULL AND resolution_comment IS NOT NULL
            AND (occurred_date IS NOT NULL XOR occurred_year IS NOT NULL))
        OR (type = 'SINGLE' AND status = 'DENIED'
            AND resolved_by_id IS NOT NULL AND resolved_at IS NOT NULL AND resolution_comment IS NOT NULL
            AND occurred_date IS NULL AND occurred_year IS NULL)
        OR (type = 'SHARED' AND status = 'FINISHED'
            AND resolved_by_id IS NOT NULL AND resolved_at IS NOT NULL
            AND occurred_date IS NULL AND occurred_year IS NULL)
    ),
    ADD INDEX idx_bets_type (type);