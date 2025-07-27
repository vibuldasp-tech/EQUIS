-- Combined schema excerpt
CREATE TABLE IF NOT EXISTS frameworks (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT,
    cycle_years INT
);
CREATE TABLE IF NOT EXISTS canonical_stages (
    id SERIAL PRIMARY KEY,
    name TEXT
);
CREATE TABLE IF NOT EXISTS stage_templates (
    id SERIAL PRIMARY KEY,
    framework_code TEXT REFERENCES frameworks(code),
    canonical_stage_id INT REFERENCES canonical_stages(id),
    name TEXT,
    default_due_days INT,
    meta JSONB
);
