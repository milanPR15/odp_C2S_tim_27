import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DbManager } from "./Database/connection/DbConnectionPool";

import { UserRepository }   from "./Database/repositories/users/UserRepository";
import { TournamentRepository } from "./Database/repositories/tournaments/TournamentRepository";
import { GamesRepository } from "./Database/repositories/games/GamesRepository";
import { AuditLogRepository } from "./Database/repositories/auditLogs/AuditLogRepository";

import { AuthService }   from "./Services/auth/AuthService";
import { UserService }   from "./Services/users/UserService";
import { TournamentService } from "./Services/tournaments/TournamentService";
import { GameService } from "./Services/games/GamesService";
import { AuditLogService } from "./Services/auditLogs/AuditLogService";

import { AuthController }   from "./WebAPI/controllers/AuthController";
import { UserController }   from "./WebAPI/controllers/UserController";
import { TournamentController } from "./WebAPI/controllers/TournamentControler";
import { GameController } from "./WebAPI/controllers/GamesController";
import { AuditLogController } from "./WebAPI/controllers/AuditLogController";

import { TeamRepository } from "./Database/repositories/team/TeamRepository";
import { TeamInvitationRepository } from "./Database/repositories/team_invitations/TeamInvitationRepository";
import { TeamService } from "./Services/teams/TeamService";
import { TeamController } from "./WebAPI/controllers/TeamController";

export const logger = new ConsoleLoggerService();
export const db     = new DbManager(logger);

// Repositories
const userRepo   = new UserRepository(db, logger);
const tournamentRepo = new TournamentRepository(db, logger);
const gamesRepo = new GamesRepository(db, logger);
const auditLogRepo = new AuditLogRepository(db, logger);
const teamRepo = new TeamRepository(db, logger);
const teamInvitationRepo = new TeamInvitationRepository(db, logger);

// Services
const teamService = new TeamService(teamRepo, teamInvitationRepo, userRepo, logger);
const authService   = new AuthService(userRepo);
const auditLogService = new AuditLogService(auditLogRepo);
const userService   = new UserService(userRepo, logger, auditLogService);
const tournamentService = new TournamentService(tournamentRepo, auditLogService);
const gameService = new GameService(gamesRepo, auditLogService);

// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/v1", new AuthController(authService).getRouter());
app.use("/api/v1", new UserController(userService).getRouter());
app.use("/api/v1", new TournamentController(tournamentService).getRouter());
app.use("/api/v1", new GameController(gameService).getRouter());
app.use("/api/v1", new AuditLogController(auditLogService).getRouter());
app.use("/api/v1", new UserController(userService).getRouter());
app.use("/api/v1", new TeamController(teamService).getRouter());
export default app;
