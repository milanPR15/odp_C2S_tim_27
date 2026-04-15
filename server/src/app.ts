import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DbManager } from "./Database/connection/DbConnectionPool";

import { UserRepository }   from "./Database/repositories/users/UserRepository";
import { EntityRepository } from "./Database/repositories/entity/EntityRepository";
import { TournamentRepository } from "./Database/repositories/tournaments/TournamentRepository";
import { GamesRepository } from "./Database/repositories/games/GamesRepository";

import { AuthService }   from "./Services/auth/AuthService";
import { UserService }   from "./Services/users/UserService";
import { EntityService } from "./Services/entity/EntityService";
import { TournamentService } from "./Services/tournaments/TournamentService";
import { GameService } from "./Services/games/GamesService";

import { AuthController }   from "./WebAPI/controllers/AuthController";
import { UserController }   from "./WebAPI/controllers/UserController";
import { EntityController } from "./WebAPI/controllers/EntityController";
import { TournamentController } from "./WebAPI/controllers/TournamentControler";
import { GameController } from "./WebAPI/controllers/GamesController";

export const logger = new ConsoleLoggerService();
export const db     = new DbManager(logger);

// Repositories
const userRepo   = new UserRepository(db, logger);
const entityRepo = new EntityRepository(db, logger);
const tournamentRepo = new TournamentRepository(db, logger);
const gamesRepo = new GamesRepository(db, logger);

// Services
const authService   = new AuthService(userRepo);
const userService   = new UserService(userRepo);
const entityService = new EntityService(entityRepo);
const tournamentService = new TournamentService(tournamentRepo);
const gameService = new GameService(gamesRepo);

// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/v1", new AuthController(authService).getRouter());
app.use("/api/v1", new UserController(userService).getRouter());
app.use("/api/v1", new EntityController(entityService).getRouter());
app.use("/api/v1", new TournamentController(tournamentService).getRouter());
app.use("/api/v1", new GameController(gameService).getRouter());
export default app;
