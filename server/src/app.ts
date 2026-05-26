import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DbManager } from "./Database/connection/DbConnectionPool";

import { UserReadRepository }   from "./Database/repositories/users/UserReadRepository";
import { TournamentReadRepository } from "./Database/repositories/tournaments/TournamentReadRepository";
import { TournamentWriteRepository } from "./Database/repositories/tournaments/TournamentWriteRepository";
import { GameWriteRepository } from "./Database/repositories/games/GamesWriteRepository";
import { GameReadRepository } from "./Database/repositories/games/GamesReadRepository";
import { AuditLogReadRepository } from "./Database/repositories/auditLogs/AuditLogReadRepository";
import { AuditLogWriteRepository } from "./Database/repositories/auditLogs/AuditLogWriteRepository";
import { MatchReadRepository } from "./Database/repositories/matches/MatchReadRepository";
import { MatchWriteRepository } from "./Database/repositories/matches/MatchWriteRepository";


import { AuthService }   from "./Services/auth/AuthService";
import { UserService }   from "./Services/users/UserService";
import { TournamentService } from "./Services/tournaments/TournamentService";
import { GameService } from "./Services/games/GamesService";
import { AuditLogService } from "./Services/auditLogs/AuditLogService";
import { MatchService } from "./Services/matches/MatchService";

import { AuthController }   from "./WebAPI/controllers/AuthController";
import { UserController }   from "./WebAPI/controllers/UserController";
import { TournamentController } from "./WebAPI/controllers/TournamentControler";
import { GameController } from "./WebAPI/controllers/GamesController";
import { AuditLogController } from "./WebAPI/controllers/AuditLogController";
import { MatchController } from "./WebAPI/controllers/MatchController";
import { HealthController } from "./WebAPI/controllers/HealthController";
import { WatchlistController } from "./WebAPI/controllers/WatchlistController";
import { TeamReadRepository } from "./Database/repositories/team/TeamReadRepository";
import { TeamWriteRepository } from "./Database/repositories/team/TeamWriteRepository";
import { TeamInvitationReadRepository } from "./Database/repositories/team_invitations/TeamInvitationReadRepository";
import { TeamInvitationWriteRepository } from "./Database/repositories/team_invitations/TeamInvitationWriteRepository";
import { TournamentRegistrationReadRepository } from "./Database/repositories/tournaments/TournamentRegistrationReadRepository";
import { TournamentRegistrationWriteRepository } from "./Database/repositories/tournaments/TournamentRegistrationWriteRepository";
import { UserWatchlistReadRepository } from "./Database/repositories/watchlists/UserWatchlistReadRepository";
import { UserWatchlistWriteRepository } from "./Database/repositories/watchlists/UserWatchlistWriteRepository";
import { TeamService } from "./Services/teams/TeamService";
import { TeamController } from "./WebAPI/controllers/TeamController";
import { UserWriteRepository } from "./Database/repositories/users/UserWriteRepository";
import { WatchlistService } from "./Services/watchlists/WatchlistService";

export const logger = new ConsoleLoggerService();
export const db     = new DbManager(logger);

// Repositories
const userReadRepo   = new UserReadRepository(db, logger);
const userWriteRepo = new UserWriteRepository(db, logger);
const tournamentReadRepo = new TournamentReadRepository(db, logger);
const tournamentWriteRepo = new TournamentWriteRepository(db, logger);
const gamesWriteRepo = new GameWriteRepository(db, logger);
const gamesReadRepo = new GameReadRepository(db, logger);
const auditLogReadRepo = new AuditLogReadRepository(db, logger);
const audithLogWriteRepo = new AuditLogWriteRepository(db, logger);
const matchReadRepo    = new MatchReadRepository(db, logger);
const matchWriteRepo    = new MatchWriteRepository(db, logger);
const teamReadRepo = new TeamReadRepository(db, logger);
const teamWriteRepo = new TeamWriteRepository(db, logger);
const teamInvitationReadRepo = new TeamInvitationReadRepository(db, logger);
const teamInvitationWriteRepo = new TeamInvitationWriteRepository(db, logger);
const tournamentRegistrationReadRepo = new TournamentRegistrationReadRepository(db, logger);
const tournamentRegistrationWriteRepo = new TournamentRegistrationWriteRepository(db, logger);
const watchlistReadRepo = new UserWatchlistReadRepository(db, logger);
const watchlistWriteRepo = new UserWatchlistWriteRepository(db, logger);

// Services
const teamService = new TeamService(teamReadRepo, teamWriteRepo, teamInvitationReadRepo,  teamInvitationWriteRepo, userReadRepo, logger);
const authService   = new AuthService(userWriteRepo, userReadRepo);
const auditLogService = new AuditLogService(audithLogWriteRepo, auditLogReadRepo);
const userService   = new UserService(userReadRepo, userWriteRepo, logger, auditLogService);
const gameService = new GameService(gamesReadRepo, gamesWriteRepo,  auditLogService);
const matchService = new MatchService(matchWriteRepo, matchReadRepo, teamReadRepo, tournamentReadRepo, logger);
const tournamentService = new TournamentService(tournamentReadRepo, tournamentWriteRepo,  gamesReadRepo, teamReadRepo, tournamentRegistrationReadRepo, tournamentRegistrationWriteRepo, auditLogService, matchService);
const watchlistService = new WatchlistService(watchlistReadRepo, watchlistWriteRepo, tournamentReadRepo);

// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/v1", new AuthController(authService).getRouter());
app.use("/api/v1", new UserController(userService).getRouter());
app.use("/api/v1", new TournamentController(tournamentService).getRouter());
app.use("/api/v1", new GameController(gameService).getRouter());
app.use("/api/v1", new AuditLogController(auditLogService).getRouter());
app.use("/api/v1", new MatchController(matchService).getRouter());
app.use("/api/v1", new UserController(userService).getRouter());
app.use("/api/v1", new TeamController(teamService).getRouter());
app.use("/api/v1", new WatchlistController(watchlistService).getRouter());
app.use("/api/v1", new HealthController(db).getRouter());
export default app;
