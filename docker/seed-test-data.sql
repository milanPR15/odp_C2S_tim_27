USE pulse_grid;

START TRANSACTION;

INSERT IGNORE INTO users (id, gamer_tag, full_name, email, password_hash, profile_image, role, is_active) VALUES
  (4, 'rina-spark', 'Rina Novak', 'rina@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (5, 'victor-edge', 'Victor Edge', 'victor@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (6, 'luna-byte', 'Luna Byte', 'luna@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (7, 'kade-flux', 'Kade Flux', 'kade@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (8, 'orion-zero', 'Orion Zero', 'orion@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'admin', 1),
  (9, 'nova-aim', 'Nova Quinn', 'nova@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (10, 'ember-surge', 'Ember Hale', 'ember@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (11, 'atlas-peak', 'Atlas Reed', 'atlas@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (12, 'keira-signal', 'Keira Sun', 'keira@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (13, 'felix-vector', 'Felix Voss', 'felix@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (14, 'zara-lane', 'Zara Lane', 'zara@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (15, 'miles-core', 'Miles Carter', 'miles@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (16, 'yuna-bolt', 'Yuna Park', 'yuna@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (17, 'arin-drift', 'Arin Vale', 'arin@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (18, 'sora-hex', 'Sora Hex', 'sora@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (19, 'troy-pulse', 'Troy Finch', 'troy@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (20, 'ivy-nova', 'Ivy Stone', 'ivy@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (21, 'ren-kai', 'Ren Kai', 'ren@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (22, 'lina-arc', 'Lina Arc', 'lina@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (23, 'jett-oxide', 'Jett Cross', 'jett@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1),
  (24, 'maya-echo', 'Maya Echo', 'maya@example.com', '$2b$10$u5Y.nwCiiAlu.vTDy/eZXeV7ZRoXy8THe7LYnSAAMPfeBe7MGSXT6', NULL, 'player', 1);

INSERT IGNORE INTO games (game_id, title, logo, genre, max_players) VALUES
  (3, 'Counter-Strike 2', 'https://dummyimage.com/400x400/0f172a/ffffff&text=CS2', 'FPS', 5),
  (4, 'Rocket League', 'https://dummyimage.com/400x400/111827/f59e0b&text=RL', 'Sports', 3),
  (5, 'Valorant', 'https://dummyimage.com/400x400/111827/22d3ee&text=VAL', 'FPS', 5),
  (6, 'Dota 2', 'https://dummyimage.com/400x400/1e1b4b/ffffff&text=D2', 'MOBA', 5),
  (7, 'League of Legends', 'https://dummyimage.com/400x400/1e3a8a/ffffff&text=LoL', 'MOBA', 5),
  (8, 'Apex Legends', 'https://dummyimage.com/400x400/7f1d1d/ffffff&text=APEX', 'Battle Royale', 3),
  (9, 'EA Sports FC 26', 'https://dummyimage.com/400x400/14532d/ffffff&text=FC26', 'Sports', 2),
  (10, 'Tekken 8', 'https://dummyimage.com/400x400/3f3f46/ffffff&text=T8', 'Fighting', 2),
  (11, 'Overwatch 2', 'https://dummyimage.com/400x400/0f766e/ffffff&text=OW2', 'Hero Shooter', 5),
  (12, 'Call of Duty: Warzone', 'https://dummyimage.com/400x400/111827/f97316&text=WZ', 'FPS', 4);

INSERT IGNORE INTO team (team_id, team_name, tag, logo, description) VALUES
  (7, 'Crimson Nova', 'CRN', 'https://dummyimage.com/400x400/7f1d1d/ffffff&text=CRN', 'Aggressive entry team for FPS brackets.'),
  (8, 'Iron Viper', 'IVP', 'https://dummyimage.com/400x400/0f766e/ffffff&text=IVP', 'Balanced squad built for long tournament runs.'),
  (9, 'Silent Pulse', 'SLP', 'https://dummyimage.com/400x400/1e3a8a/ffffff&text=SLP', 'A disciplined roster focused on utility and macro play.'),
  (10, 'North Rift', 'NRF', 'https://dummyimage.com/400x400/312e81/ffffff&text=NRF', 'Reserve team used to test registration and invite flows.'),
  (11, 'Polar Rift', 'PRF', 'https://dummyimage.com/400x400/0f172a/ffffff&text=PRF', 'Fast-paced roster built around clean rotations.'),
  (12, 'Neon Forge', 'NFG', 'https://dummyimage.com/400x400/581c87/ffffff&text=NFG', 'Pressure-heavy lineup with aggressive map control.'),
  (13, 'Quantum Bloom', 'QBM', 'https://dummyimage.com/400x400/14532d/ffffff&text=QBM', 'Versatile squad for mixed-format tournaments.'),
  (14, 'Ember Tide', 'EBT', 'https://dummyimage.com/400x400/7c2d12/ffffff&text=EBT', 'Support-heavy team with strong late-game discipline.'),
  (15, 'Silver Arc', 'SARC', 'https://dummyimage.com/400x400/334155/ffffff&text=SARC', 'A careful roster focused on objective play.'),
  (16, 'Midnight Orbit', 'MOB', 'https://dummyimage.com/400x400/111827/fafafa&text=MOB', 'A flexible lineup with good clutch conversion.'),
  (17, 'Terra Spark', 'TSP', 'https://dummyimage.com/400x400/1d4ed8/ffffff&text=TSP', 'Aggressive team that favors early tempo.'),
  (18, 'Apex Harbor', 'APH', 'https://dummyimage.com/400x400/0f766e/ffffff&text=APH', 'Composed roster designed to punish mistakes.'),
  (19, 'Velvet Node', 'VND', 'https://dummyimage.com/400x400/312e81/ffffff&text=VND', 'Technical team with strong tactical coordination.'),
  (20, 'Echo Crown', 'ECR', 'https://dummyimage.com/400x400/4c1d95/ffffff&text=ECR', 'Late-stage specialist roster used for bracket testing.');

INSERT IGNORE INTO team_members (id, team_id, user_id, role) VALUES
  (8, 7, 4, 'captain'),
  (9, 7, 5, 'member'),
  (10, 8, 6, 'captain'),
  (11, 8, 7, 'member'),
  (12, 9, 8, 'captain'),
  (13, 9, 2, 'member'),
  (14, 10, 3, 'captain'),
  (15, 10, 4, 'member'),
  (16, 11, 9, 'captain'),
  (17, 11, 10, 'member'),
  (18, 12, 11, 'captain'),
  (19, 12, 12, 'member'),
  (20, 13, 13, 'captain'),
  (21, 13, 14, 'member'),
  (22, 14, 15, 'captain'),
  (23, 14, 16, 'member'),
  (24, 15, 17, 'captain'),
  (25, 15, 18, 'member'),
  (26, 16, 19, 'captain'),
  (27, 16, 20, 'member'),
  (28, 17, 21, 'captain'),
  (29, 17, 22, 'member'),
  (30, 18, 23, 'captain'),
  (31, 18, 24, 'member'),
  (32, 19, 4, 'captain'),
  (33, 19, 6, 'member'),
  (34, 20, 5, 'captain'),
  (35, 20, 7, 'member');

INSERT IGNORE INTO team_invitations (id, team_id, user_id, status) VALUES
  (5, 7, 6, 'pending'),
  (6, 7, 7, 'accepted'),
  (7, 7, 8, 'declined'),
  (8, 8, 4, 'pending'),
  (9, 8, 5, 'accepted'),
  (10, 9, 1, 'pending'),
  (11, 9, 3, 'accepted'),
  (12, 11, 13, 'pending'),
  (13, 11, 14, 'accepted'),
  (14, 12, 15, 'pending'),
  (15, 12, 16, 'declined'),
  (16, 13, 17, 'pending'),
  (17, 13, 18, 'accepted'),
  (18, 14, 19, 'pending'),
  (19, 14, 20, 'accepted'),
  (20, 15, 21, 'pending'),
  (21, 15, 22, 'declined'),
  (22, 16, 23, 'pending'),
  (23, 16, 24, 'accepted');

INSERT IGNORE INTO tournaments (tournament_id, name, game_id, format, max_teams, entry_deadline, prize_pool, status) VALUES
  (5, 'Autumn Open', 3, 'round_robin', 4, '2026-08-01 18:00:00', 5000, 'upcoming'),
  (6, 'Winter Showdown', 4, 'double_elimination', 8, '2026-09-01 18:00:00', 10000, 'ongoing'),
  (7, 'Spring Finals', 5, 'single_elimination', 4, '2026-04-15 18:00:00', 12000, 'completed'),
  (8, 'Summer Circuit', 6, 'single_elimination', 8, '2026-10-01 18:00:00', 15000, 'upcoming'),
  (9, 'Champions Rift', 7, 'double_elimination', 8, '2026-10-15 18:00:00', 20000, 'ongoing'),
  (10, 'Neon Clash Cup', 8, 'round_robin', 6, '2026-11-01 18:00:00', 8000, 'upcoming'),
  (11, 'Fury League', 9, 'single_elimination', 8, '2026-07-20 18:00:00', 12000, 'ongoing'),
  (12, 'Apex Arena', 10, 'double_elimination', 4, '2026-06-20 18:00:00', 6000, 'upcoming'),
  (13, 'Harbor Masters', 11, 'round_robin', 6, '2026-09-10 18:00:00', 7000, 'upcoming'),
  (14, 'Zenith Open', 12, 'single_elimination', 8, '2026-12-01 18:00:00', 18000, 'upcoming'),
  (15, 'Bracket Masters Cup', 11, 'single_elimination', 8, '2026-12-10 18:00:00', 25000, 'ongoing');

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
  (16, 7, 8, '[6,7]', 'confirmed', 2),
  (17, 8, 11, '[9,10]', 'confirmed', 1),
  (18, 8, 12, '[11,12]', 'confirmed', 2),
  (19, 8, 13, '[13,14]', 'confirmed', 3),
  (20, 8, 14, '[15,16]', 'confirmed', 4),
  (21, 9, 15, '[17,18]', 'confirmed', 1),
  (22, 9, 16, '[19,20]', 'confirmed', 2),
  (23, 9, 17, '[21,22]', 'pending', NULL),
  (24, 9, 18, '[23,24]', 'confirmed', 3),
  (25, 10, 11, '[9,10]', 'confirmed', 1),
  (26, 10, 19, '[4,6]', 'confirmed', 2),
  (27, 11, 20, '[5,7]', 'confirmed', 1),
  (28, 11, 15, '[17,18]', 'disqualified', NULL),
  (29, 12, 12, '[11,12]', 'confirmed', 1),
  (30, 12, 13, '[13,14]', 'confirmed', 2),
  (31, 13, 16, '[19,20]', 'confirmed', 1),
  (32, 14, 17, '[21,22]', 'confirmed', 1),
  (33, 15, 11, '[9,10]', 'confirmed', 1),
  (34, 15, 18, '[23,24]', 'confirmed', 2),
  (35, 15, 14, '[15,16]', 'confirmed', 3),
  (36, 15, 15, '[17,18]', 'confirmed', 4),
  (37, 15, 12, '[11,12]', 'confirmed', 5),
  (38, 15, 17, '[21,22]', 'confirmed', 6),
  (39, 15, 13, '[13,14]', 'confirmed', 7),
  (40, 15, 16, '[19,20]', 'confirmed', 8);

INSERT IGNORE INTO matches (
  match_id, tournament_id, team1_id, team2_id, winner_team_id,
  next_match_id, next_match_slot, loser_next_match_id, loser_next_match_slot,
  status, scheduled_at, result
) VALUES
  (2, 7, 7, 8, 7, NULL, NULL, NULL, NULL, 'completed', '2026-05-20 18:00:00', '2-1'),
  (3, 5, 7, 9, NULL, NULL, NULL, NULL, NULL, 'scheduled', '2026-06-02 18:00:00', NULL),
  (4, 6, 1, 6, NULL, NULL, NULL, NULL, NULL, 'ongoing', '2026-05-25 19:00:00', NULL),
  (5, 8, 11, 12, 11, NULL, NULL, NULL, NULL, 'completed', '2026-09-01 18:00:00', '3-1'),
  (6, 8, 13, 14, NULL, NULL, NULL, NULL, NULL, 'scheduled', '2026-09-02 18:00:00', NULL),
  (7, 9, 15, 16, 15, NULL, NULL, NULL, NULL, 'completed', '2026-09-05 19:00:00', '2-0'),
  (8, 9, 17, 18, NULL, NULL, NULL, NULL, NULL, 'ongoing', '2026-09-06 19:00:00', NULL),
  (9, 10, 11, 19, NULL, NULL, NULL, NULL, NULL, 'scheduled', '2026-10-05 18:30:00', NULL),
  (10, 11, 20, 15, 20, NULL, NULL, NULL, NULL, 'completed', '2026-07-10 20:00:00', '1-0'),
  (11, 11, 16, 17, NULL, NULL, NULL, NULL, NULL, 'ongoing', '2026-07-11 20:00:00', NULL),
  (12, 12, 12, 13, NULL, NULL, NULL, NULL, NULL, 'scheduled', '2026-06-22 17:00:00', NULL),
  (13, 13, 14, 18, 18, NULL, NULL, NULL, NULL, 'completed', '2026-09-12 18:00:00', '2-1'),
  (14, 14, 19, 20, NULL, NULL, NULL, NULL, NULL, 'scheduled', '2026-12-03 19:00:00', NULL);

INSERT IGNORE INTO matches (
  match_id, tournament_id, team1_id, team2_id, winner_team_id,
  next_match_id, next_match_slot, loser_next_match_id, loser_next_match_slot,
  status, scheduled_at, result
) VALUES
  (21, 15, 11, 12, 11, NULL, NULL, NULL, NULL, 'completed', '2026-12-16 20:00:00', '3-1');

INSERT IGNORE INTO matches (
  match_id, tournament_id, team1_id, team2_id, winner_team_id,
  next_match_id, next_match_slot, loser_next_match_id, loser_next_match_slot,
  status, scheduled_at, result
) VALUES
  (19, 15, 11, 15, 11, 21, 'team1', NULL, NULL, 'completed', '2026-12-14 18:00:00', '2-1'),
  (20, 15, 12, 13, 12, 21, 'team2', NULL, NULL, 'completed', '2026-12-14 19:00:00', '2-0');

INSERT IGNORE INTO matches (
  match_id, tournament_id, team1_id, team2_id, winner_team_id,
  next_match_id, next_match_slot, loser_next_match_id, loser_next_match_slot,
  status, scheduled_at, result
) VALUES
  (15, 15, 11, 18, 11, 19, 'team1', NULL, NULL, 'completed', '2026-12-11 18:00:00', '2-0'),
  (16, 15, 14, 15, 15, 19, 'team2', NULL, NULL, 'completed', '2026-12-11 19:00:00', '2-1'),
  (17, 15, 12, 17, 12, 20, 'team1', NULL, NULL, 'completed', '2026-12-12 18:00:00', '2-0'),
  (18, 15, 13, 16, 13, 20, 'team2', NULL, NULL, 'completed', '2026-12-12 19:00:00', '2-1');

INSERT IGNORE INTO match_players (id, match_id, user_id, team_id, performance_notes) VALUES
  (1, 2, 4, 7, 'Opened rounds and won the first rifle duel.'),
  (2, 2, 5, 7, 'Provided clutch support in late rounds.'),
  (3, 2, 6, 8, 'Controlled the center lane with utility.'),
  (4, 2, 7, 8, 'Kept vision and traded effectively.'),
  (5, 5, 9, 11, 'Dominated opening duels and controlled mid-round rotations.'),
  (6, 5, 10, 11, 'Kept pressure on site switches and traded cleanly.'),
  (7, 5, 11, 12, 'Won late-round clutches and anchored defense.'),
  (8, 5, 12, 12, 'Opened space with utility and reliable entry timing.'),
  (9, 7, 17, 15, 'Forced tempo and secured the first objective swaps.'),
  (10, 7, 18, 15, 'Supported every push with disciplined follow-up.'),
  (11, 7, 19, 16, 'Held backline angles and denied comeback attempts.'),
  (12, 7, 20, 16, 'Converted advantages into clean round closes.'),
  (13, 10, 5, 20, 'Stayed calm under pressure and punished overextensions.'),
  (14, 10, 7, 20, 'Rotated quickly and protected the objective.'),
  (15, 13, 15, 14, 'Controlled pacing and punished overcommits.'),
  (16, 13, 16, 14, 'Read the opponent setup and forced resets.');

INSERT IGNORE INTO user_watchlist (id, user_id, tournament_id) VALUES
  (1, 2, 5),
  (2, 4, 6),
  (3, 5, 7),
  (4, 2, 8),
  (5, 4, 9),
  (6, 5, 10),
  (7, 6, 11),
  (8, 7, 12),
  (9, 9, 13),
  (10, 10, 14),
  (11, 11, 8),
  (12, 12, 9),
  (13, 13, 10);

INSERT IGNORE INTO audit_logs (id, user_id, action, entity, entity_id, meta, ip_address) VALUES
  (11, 1, 'CREATE', 'Game', 3, '{"title":"Counter-Strike 2"}', '127.0.0.1'),
  (12, 1, 'CREATE', 'Game', 4, '{"title":"Rocket League"}', '127.0.0.1'),
  (13, 1, 'CREATE', 'Game', 5, '{"title":"Valorant"}', '127.0.0.1'),
  (14, 1, 'CREATE', 'Team', 7, '{"team_name":"Crimson Nova"}', '127.0.0.1'),
  (15, 1, 'CREATE', 'Tournament', 5, '{"name":"Autumn Open"}', '127.0.0.1'),
  (16, 1, 'REGISTER', 'TournamentRegistration', 7, '{"tournament_id":5,"team_id":7}', '127.0.0.1'),
  (17, 1, 'COMPLETE', 'Match', 2, '{"winner_team_id":7}', '127.0.0.1'),
  (18, 1, 'UPDATE', 'Tournament', 6, '{"status":"ongoing"}', '127.0.0.1'),
  (19, 1, 'CREATE', 'Game', 6, '{"title":"Dota 2"}', '127.0.0.1'),
  (20, 1, 'CREATE', 'Game', 7, '{"title":"League of Legends"}', '127.0.0.1'),
  (21, 1, 'CREATE', 'Team', 11, '{"team_name":"Polar Rift"}', '127.0.0.1'),
  (22, 1, 'CREATE', 'Team', 12, '{"team_name":"Neon Forge"}', '127.0.0.1'),
  (23, 1, 'CREATE', 'Tournament', 8, '{"name":"Summer Circuit"}', '127.0.0.1'),
  (24, 1, 'REGISTER', 'TournamentRegistration', 17, '{"tournament_id":8,"team_id":11}', '127.0.0.1'),
  (25, 1, 'REGISTER', 'TournamentRegistration', 21, '{"tournament_id":9,"team_id":15}', '127.0.0.1'),
  (26, 1, 'COMPLETE', 'Match', 5, '{"winner_team_id":11}', '127.0.0.1'),
  (27, 1, 'COMPLETE', 'Match', 7, '{"winner_team_id":15}', '127.0.0.1'),
  (28, 1, 'UPDATE', 'Tournament', 9, '{"status":"ongoing"}', '127.0.0.1'),
  (29, 1, 'CREATE', 'Tournament', 15, '{"name":"Bracket Masters Cup"}', '127.0.0.1'),
  (30, 1, 'REGISTER', 'TournamentRegistration', 33, '{"tournament_id":15,"team_id":11}', '127.0.0.1'),
  (31, 1, 'COMPLETE', 'Match', 21, '{"winner_team_id":11}', '127.0.0.1');

COMMIT;