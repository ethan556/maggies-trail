-- 004_diagnostic_calibration.sql — consented field-response evidence for diagnostic calibration.
--
-- Privacy and claim boundary:
--   * no learner name, email, free text, prompt text, or IP address is stored;
--   * learner_id is an existing authorization key and cascades with account deletion;
--   * consent is versioned and recorded per administration;
--   * raw responses are immutable evidence; calibration outputs are versioned runs;
--   * a run may be marked field-calibrated only after minimum sample and quality gates.

PRAGMA foreign_keys = ON;

CREATE TABLE diagnostic_field_sessions (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  instrument_version TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  consented_at TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  start_grade INTEGER NOT NULL CHECK (start_grade BETWEEN 0 AND 13),
  item_count INTEGER NOT NULL CHECK (item_count BETWEEN 1 AND 100),
  vertical_score INTEGER NOT NULL CHECK (vertical_score BETWEEN 200 AND 800),
  vertical_se REAL NOT NULL CHECK (vertical_se > 0),
  domain_summary_json TEXT NOT NULL,
  quality_flags_json TEXT NOT NULL DEFAULT '[]',
  client_version TEXT NOT NULL,
  received_at TEXT NOT NULL
);
CREATE INDEX idx_diag_field_sessions_learner ON diagnostic_field_sessions(learner_id, completed_at);
CREATE INDEX idx_diag_field_sessions_instrument ON diagnostic_field_sessions(instrument_version, completed_at);

CREATE TABLE diagnostic_field_responses (
  session_id TEXT NOT NULL REFERENCES diagnostic_field_sessions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 1),
  item_id TEXT NOT NULL,
  concept_tag TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 0 AND 13),
  domain TEXT NOT NULL CHECK (domain IN ('number','algebra','geometry','data','calculus')),
  representation TEXT NOT NULL CHECK (representation IN ('visual','symbolic','verbal','table','graph')),
  correct INTEGER NOT NULL CHECK (correct IN (0,1)),
  selected_choice INTEGER CHECK (selected_choice IS NULL OR selected_choice >= 0),
  confidence REAL NOT NULL CHECK (confidence IN (0,0.5,1)),
  response_ms INTEGER NOT NULL CHECK (response_ms BETWEEN 100 AND 1800000),
  provisional_difficulty REAL NOT NULL,
  provisional_discrimination REAL NOT NULL CHECK (provisional_discrimination > 0),
  PRIMARY KEY (session_id, position)
);
CREATE INDEX idx_diag_field_responses_item ON diagnostic_field_responses(item_id, correct);
CREATE INDEX idx_diag_field_responses_domain ON diagnostic_field_responses(domain, grade);

CREATE TABLE diagnostic_calibration_runs (
  id TEXT PRIMARY KEY,
  instrument_version TEXT NOT NULL,
  algorithm_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  source_session_count INTEGER NOT NULL,
  source_response_count INTEGER NOT NULL,
  population_definition TEXT NOT NULL,
  quality_summary_json TEXT NOT NULL,
  scale_link_json TEXT NOT NULL,
  output_sha256 TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('research-only','candidate','field-calibrated','superseded')),
  approved_by TEXT,
  approved_at TEXT,
  notes TEXT
);

CREATE TABLE diagnostic_item_calibrations (
  run_id TEXT NOT NULL REFERENCES diagnostic_calibration_runs(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  sample_n INTEGER NOT NULL,
  p_value REAL NOT NULL,
  point_biserial REAL,
  difficulty REAL,
  difficulty_se REAL,
  discrimination REAL,
  discrimination_se REAL,
  fit_status TEXT NOT NULL,
  ci95_json TEXT NOT NULL,
  distractor_json TEXT NOT NULL,
  dif_json TEXT NOT NULL,
  quality_flags_json TEXT NOT NULL,
  PRIMARY KEY (run_id, item_id)
);

CREATE TABLE diagnostic_scale_links (
  run_id TEXT NOT NULL REFERENCES diagnostic_calibration_runs(id) ON DELETE CASCADE,
  anchor_version TEXT NOT NULL,
  anchor_item_ids_json TEXT NOT NULL,
  theta_mean REAL NOT NULL,
  theta_sd REAL NOT NULL CHECK (theta_sd > 0),
  score_intercept REAL NOT NULL,
  score_slope REAL NOT NULL CHECK (score_slope > 0),
  method TEXT NOT NULL,
  PRIMARY KEY (run_id, anchor_version)
);
