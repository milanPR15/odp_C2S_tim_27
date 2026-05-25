USE pulse_grid;

START TRANSACTION;

INSERT IGNORE INTO users (id, gamer_tag, full_name, email, password_hash, profile_image, role, is_active) VALUES
  (4, 'rina-spark', 'Rina Novak', 'rina@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (5, 'victor-edge', 'Victor Edge', 'victor@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (6, 'luna-byte', 'Luna Byte', 'luna@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (7, 'kade-flux', 'Kade Flux', 'kade@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (8, 'orion-zero', 'Orion Zero', 'orion@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'admin', 1);

INSERT IGNORE INTO games (game_id, title, logo, genre, max_players) VALUES
  (3, 'Counter-Strike 2', 'https://dummyimage.com/400x400/0f172a/ffffff&text=CS2', 'FPS', 5),
  (4, 'Rocket League', 'https://dummyimage.com/400x400/111827/f59e0b&text=RL', 'Sports', 3),
  (5, 'Valorant', 'https://dummyimage.com/400x400/111827/22d3ee&text=VAL', 'FPS', 5);

INSERT IGNORE INTO team (team_id, team_name, tag, logo, description) VALUES
  (7, 'Crimson Nova', 'CRN', 'https://dummyimage.com/400x400/7f1d1d/ffffff&text=CRN', 'Aggressive entry team for FPS brackets.'),
  (8, 'Iron Viper', 'IVP', 'https://dummyimage.com/400x400/0f766e/ffffff&text=IVP', 'Balanced squad built for long tournament runs.'),
  (9, 'Silent Pulse', 'SLP', 'https://dummyimage.com/400x400/1e3a8a/ffffff&text=SLP', 'A disciplined roster focused on utility and macro play.'),
  (10, 'North Rift', 'NRF', 'https://dummyimage.com/400x400/312e81/ffffff&text=NRF', 'Reserve team used to test registration and invite flows.');

INSERT IGNORE INTO team_members (id, team_id, user_id, role) VALUES
  (8, 7, 4, 'captain'),
  (9, 7, 5, 'member'),
  (10, 8, 6, 'captain'),
  (11, 8, 7, 'member'),
  (12, 9, 8, 'captain'),
  (13, 9, 2, 'member'),
  (14, 10, 3, 'captain'),
  (15, 10, 4, 'member');

INSERT IGNORE INTO team_invitations (id, team_id, user_id, status) VALUES
  (5, 7, 6, 'pending'),
  (6, 7, 7, 'accepted'),
  (7, 7, 8, 'declined'),
  (8, 8, 4, 'pending'),
  (9, 8, 5, 'accepted'),
  (10, 9, 1, 'pending'),
  (11, 9, 3, 'accepted');

INSERT IGNORE INTO tournaments (tournament_id, name, game_id, format, max_teams, entry_deadline, prize_pool, status) VALUES
  (5, 'Autumn Open', 3, 'round_robin', 4, '2026-08-01 18:00:00', 5000, 'upcoming'),
  (6, 'Winter Showdown', 4, 'double_elimination', 8, '2026-09-01 18:00:00', 10000, 'ongoing'),
  (7, 'Spring Finals', 5, 'single_elimination', 4, '2026-04-15 18:00:00', 12000, 'completed');

INSERT IGNORE INTO tournament_registrations (id, tournament_id, team_id, selected_player_ids, status, seed) VALUES
  (7, 5, 7, '[4,5]', 'confirmed', 1),
  (8, 5, 8, '[6,7]', 'confirmed', 2),
  (9, 5, 9, '[8,2]', 'confirmed', 3),
  (10, 5, 10, '[3,4]', 'confirmed', 4),
  (11, 6, 1, '[1,3]', 'confirmed', 1),
  (12, 6, 6, '[1,3]', 'confirmed', 2),
  (13, 6, 7, '[4,5]', 'pending', NULL),
  (14, 6, 8, '[6,7]', 'disqualified', NULL),
  (15, 7, 7, '[4,5]', 'confirmed', 1),
  (16, 7, 8, '[6,7]', 'confirmed', 2);

INSERT IGNORE INTO matches (
  match_id, tournament_id, team1_id, team2_id, winner_team_id,
  next_match_id, next_match_slot, loser_next_match_id, loser_next_match_slot,
  status, scheduled_at, result
) VALUES
  (2, 7, 7, 8, 7, NULL, NULL, NULL, NULL, 'completed', '2026-05-20 18:00:00', '2-1'),
  (3, 5, 7, 9, NULL, NULL, NULL, NULL, NULL, 'scheduled', '2026-06-02 18:00:00', NULL),
  (4, 6, 1, 6, NULL, NULL, NULL, NULL, NULL, 'ongoing', '2026-05-25 19:00:00', NULL);

INSERT IGNORE INTO match_players (id, match_id, user_id, team_id, performance_notes) VALUES
  (1, 2, 4, 7, 'Opened rounds and won the first rifle duel.'),
  (2, 2, 5, 7, 'Provided clutch support in late rounds.'),
  (3, 2, 6, 8, 'Controlled the center lane with utility.'),
  (4, 2, 7, 8, 'Kept vision and traded effectively.');

INSERT IGNORE INTO user_watchlist (id, user_id, tournament_id) VALUES
  (1, 2, 5),
  (2, 4, 6),
  (3, 5, 7);

INSERT IGNORE INTO audit_logs (id, user_id, action, entity, entity_id, meta, ip_address) VALUES
  (11, 1, 'CREATE', 'Game', 3, '{"title":"Counter-Strike 2"}', '127.0.0.1'),
  (12, 1, 'CREATE', 'Game', 4, '{"title":"Rocket League"}', '127.0.0.1'),
  (13, 1, 'CREATE', 'Game', 5, '{"title":"Valorant"}', '127.0.0.1'),
  (14, 1, 'CREATE', 'Team', 7, '{"team_name":"Crimson Nova"}', '127.0.0.1'),
  (15, 1, 'CREATE', 'Tournament', 5, '{"name":"Autumn Open"}', '127.0.0.1'),
  (16, 1, 'REGISTER', 'TournamentRegistration', 7, '{"tournament_id":5,"team_id":7}', '127.0.0.1'),
  (17, 1, 'COMPLETE', 'Match', 2, '{"winner_team_id":7}', '127.0.0.1'),
  (18, 1, 'UPDATE', 'Tournament', 6, '{"status":"ongoing"}', '127.0.0.1');

COMMIT;