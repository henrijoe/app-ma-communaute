import sqliteDB from "../../db/sqliteDB";
import { ICreateCommunauteDatabasePayload } from "./interfaces";
import fs from "fs";
import path from "path";

/**
 * Cree ou reutilise une base SQLite locale pour une communaute puis la rend active.
 */
export const createCommunauteDatabase = async (
  payload: ICreateCommunauteDatabasePayload
): Promise<{ filePath: string; fileName: string }> => {
  const communityName = payload.nomEglise || payload.nomTemple || `communaute-${payload.idUtilisateur}`;
  const tempDatabasePath = sqliteDB.buildSqliteDatabasePath(communityName, 0);
  const databasePath = payload.idUtilisateur > 0
    ? sqliteDB.buildSqliteDatabasePath(communityName, payload.idUtilisateur)
    : tempDatabasePath;

  if (payload.idUtilisateur > 0 && fs.existsSync(tempDatabasePath) && !fs.existsSync(databasePath)) {
    await fs.promises.rename(tempDatabasePath, databasePath);
  } else {
    await sqliteDB.initializeSqliteDatabase(databasePath);
  }

  await sqliteDB.setActiveSqliteDatabasePath(databasePath);

  return {
    filePath: databasePath,
    fileName: path.basename(databasePath),
  };
};

export default {
  createCommunauteDatabase,
};
