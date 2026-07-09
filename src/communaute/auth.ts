import crypto from "crypto";
import os from "os";
import { NextFunction, Request, Response } from "express";

import sqliteDB from "../db/sqliteDB";

const jwt = require("jsonwebtoken");

const TOKEN_EXPIRES_IN = process.env.LOCAL_API_TOKEN_EXPIRES_IN || "12h";

const PUBLIC_ROUTES = [
  /^\/login$/i,
  /^\/connexionutilisateur$/i,
  /^\/ajouterutilisateur$/i,
  /^\/creer-base-sqlite$/i,
  /^\/demander-reset-password$/i,
  /^\/reinitialiser-password$/i,
  /^\/server-info$/i,
  /^\/desktop-control\/status$/i,
  /^\/desktop-control\/unlock$/i,
  /^\/desktop-control\/rebind-machine$/i,
  /^\/desktop-control\/unlock-code$/i,
  /^\/tunnel\/status$/i,
];

const getLocalApiTokenSecret = (): string => {
  if (process.env.LOCAL_API_TOKEN_SECRET) {
    return process.env.LOCAL_API_TOKEN_SECRET;
  }

  return crypto
    .createHash("sha256")
    .update([
      "ma-communaute-local-api",
      os.hostname(),
      sqliteDB.getSqliteDirectory(),
    ].join("|"))
    .digest("hex");
};

export const createLocalSessionToken = (utilisateur: any): string =>
  jwt.sign(
    {
      idUtilisateur: Number(utilisateur?.idUtilisateur || 0),
      idUtilisateurParent: utilisateur?.idUtilisateurParent
        ? Number(utilisateur.idUtilisateurParent)
        : null,
      nomUtilisateur: String(utilisateur?.nomUtilisateur || ""),
      roleUtilisateur: String(utilisateur?.roleUtilisateur || "admin"),
    },
    getLocalApiTokenSecret(),
    { expiresIn: TOKEN_EXPIRES_IN }
  );

const isPublicRoute = (req: Request): boolean => {
  if (req.method === "OPTIONS") {
    return true;
  }

  return PUBLIC_ROUTES.some((route) => route.test(req.path));
};

export const requireLocalApiAuth = (req: Request, res: Response, next: NextFunction) => {
  if (isPublicRoute(req)) {
    next();
    return;
  }

  const authorization = String(req.headers.authorization || "");
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    res.status(401).send({
      status: 0,
      error: {
        name: "AUTH_REQUIRED",
        message: "Session expiree ou absente. Reconnectez-vous pour continuer.",
      },
    });
    return;
  }

  try {
    (req as any).sessionUser = jwt.verify(token, getLocalApiTokenSecret());
    next();
  } catch (_error) {
    res.status(401).send({
      status: 0,
      error: {
        name: "AUTH_INVALID",
        message: "Session invalide ou expiree. Reconnectez-vous pour continuer.",
      },
    });
  }
};
