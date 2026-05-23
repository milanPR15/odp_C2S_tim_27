CREATE DATABASE IF NOT EXISTS pulse_grid
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pulse_grid;

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  gamer_tag     VARCHAR(40)  NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_image TEXT DEFAULT NULL,
  role          ENUM('player','admin') DEFAULT 'player',
  is_active     TINYINT(1)   DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY gamer_tag (gamer_tag),
  UNIQUE KEY email (email),
  INDEX idx_gamer_tag (gamer_tag),
  INDEX idx_email (email),
  INDEX idx_full_name (full_name)
);

CREATE TABLE IF NOT EXISTS games (
  game_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(100) NOT NULL,
  logo          TEXT NOT NULL,
  genre         VARCHAR(50) NOT NULL,
  max_players   INT UNSIGNED NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_game_title (title),
  INDEX idx_title (title)
);

CREATE TABLE IF NOT EXISTS team (
  team_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  team_name     VARCHAR(50) NOT NULL,
  tag           VARCHAR(10) NOT NULL,
  logo          TEXT NOT NULL,
  description   TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY team_name (team_name),
  UNIQUE KEY tag (tag),
  INDEX idx_team_name (team_name)
);

CREATE TABLE IF NOT EXISTS team_members (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  team_id       INT UNSIGNED NOT NULL,
  user_id       INT UNSIGNED NOT NULL,
  role          ENUM('captain','member') DEFAULT 'member',
  joined_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_team_id (team_id),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_invitations (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  team_id       INT UNSIGNED NOT NULL,
  user_id       INT UNSIGNED NOT NULL,
  status        ENUM('pending','accepted','declined') DEFAULT 'pending',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_team_id (team_id),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tournaments (
  tournament_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  game_id        INT UNSIGNED NOT NULL,
  format         ENUM('single_elimination','double_elimination','round_robin') NOT NULL,
  max_teams      INT UNSIGNED NOT NULL,
  entry_deadline DATETIME NOT NULL,
  prize_pool     INT UNSIGNED NOT NULL,
  status         ENUM('upcoming','ongoing','completed') DEFAULT 'upcoming',
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tournament_name (name),
  INDEX idx_name (name),
  INDEX game_id (game_id),
  FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tournament_registrations (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tournament_id  INT UNSIGNED NOT NULL,
  team_id        INT UNSIGNED NOT NULL,
  selected_player_ids TEXT DEFAULT NULL,
  registered_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  status         ENUM('pending','confirmed','disqualified') DEFAULT 'pending',
  seed           INT UNSIGNED DEFAULT NULL,
  INDEX idx_tournament_id (tournament_id),
  INDEX idx_team_id (team_id),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES team(team_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matches (
  match_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tournament_id  INT UNSIGNED NOT NULL,
  team1_id       INT UNSIGNED NOT NULL,
  team2_id       INT UNSIGNED NOT NULL,

  winner_team_id INT UNSIGNED DEFAULT NULL,
  next_match_id  INT UNSIGNED DEFAULT NULL,
  next_match_slot ENUM('team1','team2') DEFAULT NULL,
  status ENUM('scheduled','ongoing','completed') DEFAULT 'scheduled',

  scheduled_at   DATETIME NOT NULL,
  result         VARCHAR(20) DEFAULT NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tournament_id (tournament_id),
  INDEX team1_id (team1_id),
  INDEX team2_id (team2_id),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  FOREIGN KEY (team1_id) REFERENCES team(team_id) ON DELETE CASCADE,
  FOREIGN KEY (team2_id) REFERENCES team(team_id) ON DELETE CASCADE,
  FOREIGN KEY (winner_team_id) REFERENCES team(team_id) ON DELETE SET NULL,
  FOREIGN KEY (next_match_id) REFERENCES matches(match_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS match_players (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  match_id          INT UNSIGNED NOT NULL,
  user_id           INT UNSIGNED NOT NULL,
  team_id           INT UNSIGNED NOT NULL,
  performance_notes TEXT,
  INDEX idx_match_id (match_id),
  INDEX idx_user_id (user_id),
  INDEX team_id (team_id),
  FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES team(team_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_watchlist (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  tournament_id  INT UNSIGNED NOT NULL,
  added_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_tournament_id (tournament_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED,
  action         VARCHAR(255) NOT NULL,
  entity         VARCHAR(50) NOT NULL,
  entity_id      INT UNSIGNED NOT NULL,
  meta           TEXT DEFAULT NULL,
  ip_address     VARCHAR(45) DEFAULT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);