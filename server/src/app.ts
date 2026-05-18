import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DbManager } from "./Database/connection/DbConnectionPool";

import { UserRepository }   from "./Database/repositories/users/UserRepository";
import { EntityRepository } from "./Database/repositories/entity/EntityRepository";
import { TournamentRepository } from "./Database/repositories/tournaments/TournamentRepository";
import { GamesRepository } from "./Database/repositories/games/GamesRepository";
import { AuditLogRepository } from "./Database/repositories/auditLogs/AuditLogRepository";
import { MatchRepository } from "./Database/repositories/matches/MatchRepository";

import { AuthService }   from "./Services/auth/AuthService";
import { UserService }   from "./Services/users/UserService";
import { EntityService } from "./Services/entity/EntityService";
import { TournamentService } from "./Services/tournaments/TournamentService";
import { GameService } from "./Services/games/GamesService";
import { AuditLogService } from "./Services/auditLogs/AuditLogService";
import { MatchService } from "./Services/matches/MatchService";

import { AuthController }   from "./WebAPI/controllers/AuthController";
import { UserController }   from "./WebAPI/controllers/UserController";
import { EntityController } from "./WebAPI/controllers/EntityController";
import { TournamentController } from "./WebAPI/controllers/TournamentControler";
import { GameController } from "./WebAPI/controllers/GamesController";
import { AuditLogController } from "./WebAPI/controllers/AuditLogController";
import { MatchController } from "./WebAPI/controllers/MatchController";
import { TeamRepository } from "./Database/repositories/team/TeamRepository";





export const logger = new ConsoleLoggerService();
export const db     = new DbManager(logger);

// Repositories
const userRepo   = new UserRepository(db, logger);
const entityRepo = new EntityRepository(db, logger);
const tournamentRepo = new TournamentRepository(db, logger);
const gamesRepo = new GamesRepository(db, logger);
const auditLogRepo = new AuditLogRepository(db, logger);
const matchRepo    = new MatchRepository(db, logger);
const teamRepo     = new TeamRepository(db, logger);


// Services
const authService   = new AuthService(userRepo);
const userService   = new UserService(userRepo);
const entityService = new EntityService(entityRepo);
const auditLogService = new AuditLogService(auditLogRepo);
const tournamentService = new TournamentService(tournamentRepo, auditLogService);
const gameService = new GameService(gamesRepo, auditLogService);
const matchService = new MatchService(matchRepo, teamRepo, logger);

// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/v1", new AuthController(authService).getRouter());
app.use("/api/v1", new UserController(userService).getRouter());
app.use("/api/v1", new EntityController(entityService).getRouter());
app.use("/api/v1", new TournamentController(tournamentService).getRouter());
app.use("/api/v1", new GameController(gameService).getRouter());
app.use("/api/v1", new AuditLogController(auditLogService).getRouter());
app.use("/api/v1", new MatchController(matchService).getRouter());
export default app;
