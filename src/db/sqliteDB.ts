import fs from "fs";
import os from "os";
import path from "path";
import sqlite3 from "sqlite3";

const AdmZip = require("adm-zip");

const WINDOWS_SQLITE_DIR = "C:\\base-communaute";
const SQLITE_BACKUP_DIR_NAME = "sauvegardes";
const SQLITE_BACKUP_RETENTION_COUNT = Number(process.env.SQLITE_BACKUP_RETENTION_COUNT || 30);

const resolveDefaultSqliteDirectory = (): string => {
  if (process.env.SQLITE_DB_DIR) {
    return process.env.SQLITE_DB_DIR;
  }

  if (process.platform === "win32") {
    return WINDOWS_SQLITE_DIR;
  }

  if (process.platform === "darwin") {
    return path.join(
      os.homedir(),
      "Library",
      "Application Support",
      "Ma Communaute",
      "base-communaute"
    );
  }

  return path.join(os.homedir(), ".ma-communaute", "base-communaute");
};

const DEFAULT_SQLITE_DIR = resolveDefaultSqliteDirectory();
const ACTIVE_DB_FILE = path.join(DEFAULT_SQLITE_DIR, ".active-db.json");
const DEFAULT_SQLITE_FILE = path.join(DEFAULT_SQLITE_DIR, "ma-communaute-local.db");
const TEMPLATE_PATH = path.resolve(__dirname, "../../templates/ma-communaute.sql");
const preparedSqliteDatabases = new Set<string>();

type PrimaryKeyMap = Record<string, string[]>;

type IndexDefinition = {
  tableName: string;
  indexName: string;
  columns: string[];
};

type DailySqliteBackupResult = {
  created: boolean;
  databaseCount: number;
  filePath?: string;
  deletedBackups: number;
  reason?: string;
};

type RestoreSqliteBackupResult = {
  restored: boolean;
  databaseCount: number;
  restoredFiles: string[];
  safetyBackupPath: string | null;
};

/**
 * Indique si le serveur doit travailler sur SQLite au lieu de MySQL.
 */
export const isSqliteMode = (): boolean => process.env.DB_MODE === "sqlite";

/**
 * Retourne le mode de base de donnees actif pour les logs de demarrage.
 */
export const getDatabaseMode = (): "sqlite" | "mysql" =>
  (isSqliteMode() ? "sqlite" : "mysql");

/**
 * Retourne le dossier de travail des bases SQLite locales.
 */
export const getSqliteDirectory = (): string => DEFAULT_SQLITE_DIR;

/**
 * Retourne le chemin de la base SQLite generique utilisee avant la creation
 * definitive d'une eglise.
 */
export const getDefaultSqliteDatabasePath = (): string => DEFAULT_SQLITE_FILE;

/**
 * Nettoie une valeur pour construire un nom de fichier Windows stable.
 */
const sanitizeFileName = (value: string): string => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[<>:"/\\|?*\x00-\x1f]/g, " ")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "")
  .toLowerCase();

/**
 * Transforme un type MySQL en type compatible avec SQLite.
 */
const mapMysqlTypeToSqlite = (mysqlType: string): string => {
  const normalizedType = mysqlType.toLowerCase();

  if (
    normalizedType.includes("int")
    || normalizedType.includes("bit")
    || normalizedType.includes("bool")
  ) {
    return "INTEGER";
  }

  if (
    normalizedType.includes("decimal")
    || normalizedType.includes("double")
    || normalizedType.includes("float")
    || normalizedType.includes("real")
  ) {
    return "REAL";
  }

  if (normalizedType.includes("blob")) {
    return "BLOB";
  }

  return "TEXT";
};

/**
 * Recupere les cles primaires declarees dans les ALTER TABLE du dump.
 */
const extractPrimaryKeys = (dump: string): PrimaryKeyMap => {
  const primaryKeys: PrimaryKeyMap = {};
  const regex = /ALTER TABLE\s+`([^`]+)`[\s\S]*?ADD PRIMARY KEY\s+\(([^)]+)\)/g;

  let match = regex.exec(dump);
  while (match) {
    // On memorise les colonnes de cle primaire pour les reinjecter
    // ensuite dans les CREATE TABLE converts vers SQLite.
    primaryKeys[match[1]] = match[2]
      .split(",")
      .map((column) => column.replace(/`/g, "").trim())
      .filter(Boolean);
    match = regex.exec(dump);
  }

  return primaryKeys;
};

/**
 * Recupere les indexes simples a recreer apres les CREATE TABLE.
 */
const extractIndexes = (dump: string): IndexDefinition[] => {
  const indexes: IndexDefinition[] = [];
  const alterBlockRegex = /ALTER TABLE\s+`([^`]+)`([\s\S]*?);/g;

  let blockMatch = alterBlockRegex.exec(dump);
  while (blockMatch) {
    // Chaque bloc ALTER TABLE peut contenir plusieurs indexes a recreer.
    const tableName = blockMatch[1];
    const statements = blockMatch[2];
    const keyRegex = /ADD KEY\s+`([^`]+)`\s+\(([^)]+)\)/g;

    let keyMatch = keyRegex.exec(statements);
    while (keyMatch) {
      indexes.push({
        tableName,
        indexName: keyMatch[1],
        columns: keyMatch[2]
          .split(",")
          .map((column) => column.replace(/`/g, "").trim())
          .filter(Boolean),
      });
      keyMatch = keyRegex.exec(statements);
    }

    blockMatch = alterBlockRegex.exec(dump);
  }

  return indexes;
};

/**
 * Convertit un CREATE TABLE MySQL en CREATE TABLE SQLite.
 */
const convertCreateTableStatement = (
  createStatement: string,
  primaryKeys: PrimaryKeyMap
): string => {
  const tableMatch = createStatement.match(/CREATE TABLE\s+`([^`]+)`\s*\(([\s\S]*?)\)\s*ENGINE=/i);
  if (!tableMatch) {
    throw new Error("Impossible de convertir un bloc CREATE TABLE du dump.");
  }

  const tableName = tableMatch[1];
  const body = tableMatch[2];
  const primaryKeyColumns = primaryKeys[tableName] || [];

  const columnDefinitions = body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("`"))
    .map((line) => line.replace(/,$/, ""))
    .map((line) => {
      const columnMatch = line.match(/^`([^`]+)`\s+(.+)$/);
      if (!columnMatch) {
        return null;
      }

      const columnName = columnMatch[1];
      const rawDefinition = columnMatch[2]
        .replace(/CHARACTER SET\s+\w+/gi, "")
        .replace(/COLLATE\s+\w+/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      // On detecte le type de base MySQL pour le ramener vers
      // l'affinite SQLite la plus proche.
      const typeMatch = rawDefinition.match(/^([a-zA-Z]+(?:\(\d+(?:,\d+)?\))?)/);
      const sqliteType = mapMysqlTypeToSqlite(typeMatch ? typeMatch[1] : "text");
      const isSingleIntegerPrimaryKey = primaryKeyColumns.length === 1
        && primaryKeyColumns[0] === columnName
        && sqliteType === "INTEGER";

      if (isSingleIntegerPrimaryKey) {
        // SQLite gere tres bien ce cas via INTEGER PRIMARY KEY AUTOINCREMENT.
        return `"${columnName}" INTEGER PRIMARY KEY AUTOINCREMENT`;
      }

      const constraints: string[] = [`"${columnName}"`, sqliteType];

      if (/\bNOT NULL\b/i.test(rawDefinition)) {
        constraints.push("NOT NULL");
      }

      return constraints.join(" ");
    })
    .filter((line): line is string => Boolean(line));

  if (primaryKeyColumns.length > 1) {
    // Pour les cles primaires composites, on ajoute une contrainte de table.
    columnDefinitions.push(
      `PRIMARY KEY (${primaryKeyColumns.map((column) => `"${column}"`).join(", ")})`
    );
  }

  return `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${columnDefinitions.join(",\n  ")}\n);`;
};

/**
 * Convertit une instruction INSERT MySQL en syntaxe SQLite.
 */
const convertInsertStatement = (statement: string): string => statement
  .replace(/\\'/g, "''")
  .replace(/`/g, '"');

/**
 * Convertit le dump MySQL de reference en instructions SQLite.
 */
const convertMysqlDumpToSqliteStatements = (
  dump: string
): { schemaStatements: string[]; seedStatements: string[] } => {
  const sanitizedDump = dump
    .replace(/\r/g, "")
    .replace(/^--.*$/gm, "")
    .replace(/^SET\s+.*;$/gim, "")
    .replace(/^\/\*![\s\S]*?\*\/;?$/gm, "")
    .trim();

  // Le dump est separe entre schema et donnees afin de pouvoir :
  // 1. initialiser une base vide avec ses seeds
  // 2. mettre a jour une base existante sans reinserer les donnees.
  const primaryKeys = extractPrimaryKeys(sanitizedDump);
  const indexes = extractIndexes(sanitizedDump);
  const createStatements = [...sanitizedDump.matchAll(/CREATE TABLE[\s\S]*?ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;/g)]
    .map((match) => convertCreateTableStatement(match[0], primaryKeys));
  const sqliteNativeCreateStatements = [...sanitizedDump.matchAll(/CREATE TABLE IF NOT EXISTS[\s\S]*?;/gi)]
    .map((match) => match[0].trim());
  const seedStatements = [...sanitizedDump.matchAll(/INSERT INTO[\s\S]*?;/g)]
    .map((match) => convertInsertStatement(match[0]));
  const indexStatements = indexes.map((index) => `CREATE INDEX IF NOT EXISTS "${index.indexName}" ON "${index.tableName}" (${index.columns.map((column) => `"${column}"`).join(", ")});`);
  const sqliteNativeIndexStatements = [...sanitizedDump.matchAll(/CREATE INDEX IF NOT EXISTS[\s\S]*?;/gi)]
    .map((match) => match[0].trim());

  return {
    schemaStatements: [
      "PRAGMA foreign_keys = OFF;",
      ...createStatements,
      ...sqliteNativeCreateStatements,
      ...indexStatements,
      ...sqliteNativeIndexStatements,
      "PRAGMA foreign_keys = ON;",
    ],
    seedStatements,
  };
};

/**
 * Ouvre une connexion SQLite sur le fichier demande.
 */
const openDatabase = (databasePath: string): sqlite3.Database => {
  const sqlite = sqlite3.verbose();
  return new sqlite.Database(databasePath);
};

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const backupSqliteDatabaseFile = async (
  sourceDatabasePath: string,
  backupDatabasePath: string
): Promise<void> => new Promise((resolve, reject) => {
  const database = openDatabase(sourceDatabasePath);
  let settled = false;

  const closeAndSettle = (error?: Error | null) => {
    if (settled) {
      return;
    }

    settled = true;
    database.close((closeError) => {
      const finalError = error || closeError;

      if (finalError) {
        reject(finalError);
        return;
      }

      resolve();
    });
  };

  try {
    const backup = (database as any).backup(backupDatabasePath, (error: Error | null) => {
      if (error) {
        closeAndSettle(error);
      }
    });

    backup.step(-1, (stepError: Error | null) => {
      if (stepError) {
        closeAndSettle(stepError);
        return;
      }

      if (typeof backup.finish === "function") {
        backup.finish((finishError: Error | null) => closeAndSettle(finishError));
        return;
      }

      closeAndSettle(null);
    });
  } catch (error: any) {
    closeAndSettle(error);
  }
});

const createSqliteBackupArchive = async (
  databaseFiles: string[],
  backupFilePath: string,
  reason: string
): Promise<void> => {
  const backupDirectory = path.dirname(backupFilePath);
  const dateKey = formatDateKey(new Date());
  const tempDirectory = path.join(backupDirectory, `.tmp-${dateKey}-${Date.now()}`);
  await fs.promises.mkdir(tempDirectory, { recursive: true });

  try {
    const zip = new AdmZip();

    for (const fileName of databaseFiles) {
      const sourceDatabasePath = path.join(DEFAULT_SQLITE_DIR, fileName);
      const tempDatabasePath = path.join(tempDirectory, fileName);

      await backupSqliteDatabaseFile(sourceDatabasePath, tempDatabasePath);
      zip.addLocalFile(tempDatabasePath, "bases");
    }

    zip.addFile(
      "manifest.json",
      Buffer.from(
        JSON.stringify(
          {
            createdAt: new Date().toISOString(),
            reason,
            sqliteDirectory: DEFAULT_SQLITE_DIR,
            databases: databaseFiles,
          },
          null,
          2
        ),
        "utf-8"
      )
    );

    zip.writeZip(backupFilePath);
  } finally {
    await fs.promises.rm(tempDirectory, { recursive: true, force: true });
  }
};

const cleanupOldSqliteBackups = async (backupDirectory: string): Promise<number> => {
  const retentionCount = Number.isInteger(SQLITE_BACKUP_RETENTION_COUNT)
    && SQLITE_BACKUP_RETENTION_COUNT > 0
    ? SQLITE_BACKUP_RETENTION_COUNT
    : 30;

  const backupFiles = (await fs.promises.readdir(backupDirectory))
    .filter((fileName) => /^sauvegarde-sqlite-\d{4}-\d{2}-\d{2}\.zip$/.test(fileName))
    .sort()
    .reverse();

  const filesToDelete = backupFiles.slice(retentionCount);

  for (const fileName of filesToDelete) {
    await fs.promises.unlink(path.join(backupDirectory, fileName));
  }

  return filesToDelete.length;
};

/**
 * Cree une sauvegarde zip quotidienne des bases SQLite locales.
 */
export const ensureDailySqliteBackup = async (): Promise<DailySqliteBackupResult> => {
  await ensureSqliteDirectory();

  const databaseFiles = (await fs.promises.readdir(DEFAULT_SQLITE_DIR))
    .filter((fileName) => fileName.endsWith(".db"))
    .sort();

  const backupDirectory = path.join(DEFAULT_SQLITE_DIR, SQLITE_BACKUP_DIR_NAME);
  await fs.promises.mkdir(backupDirectory, { recursive: true });

  const todayKey = formatDateKey(new Date());
  const backupFilePath = path.join(backupDirectory, `sauvegarde-sqlite-${todayKey}.zip`);

  if (fs.existsSync(backupFilePath)) {
    const deletedBackups = await cleanupOldSqliteBackups(backupDirectory);

    return {
      created: false,
      databaseCount: databaseFiles.length,
      filePath: backupFilePath,
      deletedBackups,
      reason: "already-exists",
    };
  }

  if (databaseFiles.length === 0) {
    const deletedBackups = await cleanupOldSqliteBackups(backupDirectory);

    return {
      created: false,
      databaseCount: 0,
      deletedBackups,
      reason: "no-database",
    };
  }

  await createSqliteBackupArchive(databaseFiles, backupFilePath, "daily-auto-backup");
  const deletedBackups = await cleanupOldSqliteBackups(backupDirectory);

  return {
    created: true,
    databaseCount: databaseFiles.length,
    filePath: backupFilePath,
    deletedBackups,
  };
};

const validateSqliteDatabaseFile = async (databasePath: string): Promise<void> => new Promise((resolve, reject) => {
  const database = openDatabase(databasePath);

  database.all("PRAGMA integrity_check;", (error, rows: any[]) => {
    database.close((closeError) => {
      if (error || closeError) {
        reject(error || closeError);
        return;
      }

      const integrityResult = String(rows?.[0]?.integrity_check || "").toLowerCase();

      if (integrityResult !== "ok") {
        reject(new Error(`La base ${path.basename(databasePath)} est invalide ou corrompue.`));
        return;
      }

      resolve();
    });
  });
});

const isSafeDatabaseEntryName = (entryName: string): boolean => {
  const normalizedEntryName = entryName.replace(/\\/g, "/");
  const parts = normalizedEntryName.split("/").filter(Boolean);
  const fileName = parts[parts.length - 1] || "";

  return (
    parts.length === 2
    && parts[0] === "bases"
    && fileName === path.basename(fileName)
    && fileName.endsWith(".db")
    && !fileName.startsWith(".")
  );
};

/**
 * Restaure les bases SQLite depuis une archive zip generee par l'application.
 */
export const restoreSqliteBackupArchive = async (
  backupZipPath: string
): Promise<RestoreSqliteBackupResult> => {
  await ensureSqliteDirectory();

  if (!backupZipPath || !fs.existsSync(backupZipPath)) {
    throw new Error("Le fichier de sauvegarde SQLite est introuvable.");
  }

  const backupDirectory = path.join(DEFAULT_SQLITE_DIR, SQLITE_BACKUP_DIR_NAME);
  await fs.promises.mkdir(backupDirectory, { recursive: true });

  const restoreKey = new Date().toISOString().replace(/[:.]/g, "-");
  const tempDirectory = path.join(backupDirectory, `.restore-${restoreKey}`);
  await fs.promises.mkdir(tempDirectory, { recursive: true });

  try {
    const zip = new AdmZip(backupZipPath);
    const databaseEntries = zip
      .getEntries()
      .filter((entry) => !entry.isDirectory && isSafeDatabaseEntryName(entry.entryName));

    if (databaseEntries.length === 0) {
      throw new Error("Cette sauvegarde ne contient aucune base SQLite restaurable.");
    }

    const restoredFiles: string[] = [];

    for (const entry of databaseEntries) {
      const fileName = path.basename(entry.entryName.replace(/\\/g, "/"));
      const tempDatabasePath = path.join(tempDirectory, fileName);

      await fs.promises.writeFile(tempDatabasePath, entry.getData());
      await validateSqliteDatabaseFile(tempDatabasePath);
      restoredFiles.push(fileName);
    }

    const currentDatabaseFiles = (await fs.promises.readdir(DEFAULT_SQLITE_DIR))
      .filter((fileName) => fileName.endsWith(".db"))
      .sort();
    const safetyBackupPath = currentDatabaseFiles.length > 0
      ? path.join(backupDirectory, `sauvegarde-avant-restauration-${restoreKey}.zip`)
      : null;

    if (safetyBackupPath) {
      await createSqliteBackupArchive(currentDatabaseFiles, safetyBackupPath, "before-restore");
    }

    for (const fileName of restoredFiles) {
      const tempDatabasePath = path.join(tempDirectory, fileName);
      const destinationPath = path.join(DEFAULT_SQLITE_DIR, fileName);
      const pendingDestinationPath = path.join(DEFAULT_SQLITE_DIR, `.restoring-${restoreKey}-${fileName}`);

      await fs.promises.copyFile(tempDatabasePath, pendingDestinationPath);

      if (fs.existsSync(destinationPath)) {
        await fs.promises.rm(destinationPath, { force: true });
      }

      await fs.promises.rename(pendingDestinationPath, destinationPath);
    }

    preparedSqliteDatabases.clear();

    return {
      restored: true,
      databaseCount: restoredFiles.length,
      restoredFiles,
      safetyBackupPath,
    };
  } finally {
    await fs.promises.rm(tempDirectory, { recursive: true, force: true });
  }
};

/**
 * Construit les instructions completes d'initialisation d'une nouvelle base.
 */
const buildFullInitializationStatements = (dump: string): string[] => {
  const { schemaStatements, seedStatements } = convertMysqlDumpToSqliteStatements(dump);

  return [
    // On ouvre par PRAGMA OFF, puis schema, puis seeds, puis PRAGMA ON.
    ...schemaStatements.slice(0, 1),
    ...schemaStatements.slice(1, -1),
    ...seedStatements,
    ...schemaStatements.slice(-1),
  ];
};

/**
 * Execute une liste d'instructions SQLite dans une transaction.
 */
const executeStatements = (
  database: sqlite3.Database,
  statements: string[]
): Promise<void> => new Promise((resolve, reject) => {
  database.serialize(() => {
    // Une transaction garantit que la base ne reste pas a moitie migree.
    database.exec("BEGIN TRANSACTION;", (beginError) => {
      if (beginError) {
        reject(beginError);
        return;
      }

      let currentIndex = 0;

      const executeNext = () => {
        if (currentIndex >= statements.length) {
          // Toutes les instructions sont passees, on valide la transaction.
          database.exec("COMMIT;", (commitError) => {
            if (commitError) {
              reject(commitError);
              return;
            }

            resolve();
          });
          return;
        }

        const statement = statements[currentIndex];
        currentIndex += 1;

        database.exec(statement, (statementError) => {
          if (statementError) {
            // En cas d'erreur sur une instruction, on annule tout le lot.
            database.exec("ROLLBACK;", () => reject(statementError));
            return;
          }

          executeNext();
        });
      };

      executeNext();
    });
  });
});

type SqliteTableInfoRow = {
  name: string;
  pk: number;
  type: string;
};

const queryDatabase = (database: sqlite3.Database, sql: string): Promise<any[]> => new Promise((resolve, reject) => {
  database.all(sql, (error, rows) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(rows || []);
  });
});

const execDatabase = (database: sqlite3.Database, sql: string): Promise<void> => new Promise((resolve, reject) => {
  database.exec(sql, (error) => {
    if (error) {
      reject(error);
      return;
    }

    resolve();
  });
});

const hasBrokenAutoIncrementPrimaryKey = async (
  database: sqlite3.Database,
  tableName: string,
  primaryKeyName: string
): Promise<boolean> => {
  const rows = await queryDatabase(database, `PRAGMA table_info("${tableName}")`) as SqliteTableInfoRow[];
  if (rows.length === 0) {
    return false;
  }

  const primaryKeyRow = rows.find((row) => row.name === primaryKeyName);
  if (!primaryKeyRow) {
    return true;
  }

  return primaryKeyRow.pk != 1 || primaryKeyRow.type.toUpperCase() != "INTEGER";
};

const ensureColumnExists = async (
  database: sqlite3.Database,
  tableName: string,
  columnName: string,
  definition: string
): Promise<void> => {
  const rows = await queryDatabase(database, `PRAGMA table_info("${tableName}")`) as SqliteTableInfoRow[];
  if (rows.some((row) => row.name === columnName)) {
    return;
  }

  await execDatabase(database, `ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${definition};`);
};

const ensureMembreAndDecesColumns = async (database: sqlite3.Database): Promise<void> => {
  await ensureColumnExists(database, 'membre', 'estDecede', 'INTEGER DEFAULT 0');
  await ensureColumnExists(database, 'membre', 'dateDecesMembre', 'TEXT');
  await ensureColumnExists(database, 'deces', 'idMembre', 'INTEGER');
  await ensureColumnExists(database, 'maladie', 'idMembre', 'INTEGER');
  await ensureColumnExists(database, 'mariage', 'idFrereMembre', 'INTEGER');
  await ensureColumnExists(database, 'mariage', 'idSoeurMembre', 'INTEGER');
  await execDatabase(database, 'UPDATE "membre" SET "estDecede" = 0 WHERE "estDecede" IS NULL;');
};

const ensureMembreInscriptionDemandeTable = async (database: sqlite3.Database): Promise<void> => {
  await execDatabase(database, `
    CREATE TABLE IF NOT EXISTS "membre_inscription_demande" (
      "idDemandeInscription" INTEGER PRIMARY KEY AUTOINCREMENT,
      "idUtilisateur" INTEGER NOT NULL,
      "nomMembre" TEXT,
      "prenomMembre" TEXT,
      "contactMembre" TEXT,
      "payloadDemande" TEXT NOT NULL,
      "statutDemande" TEXT DEFAULT 'en_attente',
      "idMembreCree" INTEGER,
      "dateCreation" TEXT DEFAULT CURRENT_TIMESTAMP,
      "dateTraitement" TEXT
    );
    CREATE INDEX IF NOT EXISTS "idx_membre_inscription_demande_utilisateur_sqlite"
      ON "membre_inscription_demande" ("idUtilisateur", "statutDemande");
  `);
};

const ensureVersetProgrammeTable = async (database: sqlite3.Database): Promise<void> => {
  await execDatabase(database, `
    CREATE TABLE IF NOT EXISTS "verset_programme" (
      "idVersetProgramme" INTEGER PRIMARY KEY AUTOINCREMENT,
      "idUtilisateur" INTEGER NOT NULL,
      "dateAffichage" TEXT NOT NULL,
      "reference" TEXT,
      "texte" TEXT NOT NULL,
      "dateCreation" TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "idx_verset_programme_utilisateur_date"
      ON "verset_programme" ("idUtilisateur", "dateAffichage");
  `);
};

const ensureComptabiliteColumns = async (database: sqlite3.Database): Promise<void> => {
  await ensureColumnExists(database, 'comptabilite', 'estSupprimeComptabilite', 'INTEGER DEFAULT 0');
  await ensureColumnExists(database, 'comptabilite', 'dateSuppressionComptabilite', 'TEXT');
  await ensureColumnExists(database, 'comptabilite', 'motifSuppressionComptabilite', 'TEXT');
  await ensureColumnExists(database, 'comptabilite', 'supprimeParUtilisateur', 'INTEGER');
  await execDatabase(database, 'UPDATE "comptabilite" SET "estSupprimeComptabilite" = 0 WHERE "estSupprimeComptabilite" IS NULL;');
};

const repairBrokenGalerieTables = async (database: sqlite3.Database): Promise<void> => {
  const galerieBroken = await hasBrokenAutoIncrementPrimaryKey(database, "galerie", "idGalerie");
  if (galerieBroken) {
    await execDatabase(database, `
      DROP TABLE IF EXISTS "__galerie_repair";
      CREATE TABLE "__galerie_repair" (
        "idGalerie" INTEGER PRIMARY KEY AUTOINCREMENT,
        "titreGalerie" TEXT,
        "typeEvenement" TEXT,
        "dateEvenement" TEXT,
        "lieuEvenement" TEXT,
        "descriptionGalerie" TEXT,
        "couvertureGalerie" TEXT,
        "dossierGalerie" TEXT,
        "dateCreation" TEXT DEFAULT CURRENT_TIMESTAMP,
        "idUtilisateur" INTEGER
      );
      INSERT INTO "__galerie_repair" (
        "idGalerie",
        "titreGalerie",
        "typeEvenement",
        "dateEvenement",
        "lieuEvenement",
        "descriptionGalerie",
        "couvertureGalerie",
        "dossierGalerie",
        "dateCreation",
        "idUtilisateur"
      )
      SELECT
        "idGalerie",
        "titreGalerie",
        "typeEvenement",
        "dateEvenement",
        "lieuEvenement",
        "descriptionGalerie",
        "couvertureGalerie",
        "dossierGalerie",
        "dateCreation",
        "idUtilisateur"
      FROM "galerie";
      DROP TABLE "galerie";
      ALTER TABLE "__galerie_repair" RENAME TO "galerie";
      CREATE INDEX IF NOT EXISTS "idx_galerie_utilisateur_sqlite" ON "galerie" ("idUtilisateur");
    `);
  }

  const galerieImageBroken = await hasBrokenAutoIncrementPrimaryKey(database, "galerie_image", "idGalerieImage");
  if (galerieImageBroken) {
    await execDatabase(database, `
      DROP TABLE IF EXISTS "__galerie_image_repair";
      CREATE TABLE "__galerie_image_repair" (
        "idGalerieImage" INTEGER PRIMARY KEY AUTOINCREMENT,
        "idGalerie" INTEGER NOT NULL,
        "nomFichier" TEXT,
        "cheminImage" TEXT,
        "tailleImage" INTEGER,
        "typeMime" TEXT,
        "legendeImage" TEXT,
        "dateAjout" TEXT DEFAULT CURRENT_TIMESTAMP,
        "idUtilisateur" INTEGER
      );
      INSERT INTO "__galerie_image_repair" (
        "idGalerieImage",
        "idGalerie",
        "nomFichier",
        "cheminImage",
        "tailleImage",
        "typeMime",
        "legendeImage",
        "dateAjout",
        "idUtilisateur"
      )
      SELECT
        "idGalerieImage",
        "idGalerie",
        "nomFichier",
        "cheminImage",
        "tailleImage",
        "typeMime",
        "legendeImage",
        "dateAjout",
        "idUtilisateur"
      FROM "galerie_image";
      DROP TABLE "galerie_image";
      ALTER TABLE "__galerie_image_repair" RENAME TO "galerie_image";
      CREATE INDEX IF NOT EXISTS "idx_galerie_image_galerie_sqlite" ON "galerie_image" ("idGalerie");
      CREATE INDEX IF NOT EXISTS "idx_galerie_image_utilisateur_sqlite" ON "galerie_image" ("idUtilisateur");
    `);
  }
};

// Le dump d'origine ne declarait pas idMaladie comme cle primaire/auto-increment
// (contrairement a deces/mariage) : les bases SQLite deja creees avant ce correctif
// ont donc une table `maladie` qui rejette tout INSERT (idMaladie NOT NULL sans defaut).
const repairBrokenMaladieTable = async (database: sqlite3.Database): Promise<void> => {
  const maladieBroken = await hasBrokenAutoIncrementPrimaryKey(database, "maladie", "idMaladie");
  if (!maladieBroken) {
    return;
  }

  await execDatabase(database, `
    DROP TABLE IF EXISTS "__maladie_repair";
    CREATE TABLE "__maladie_repair" (
      "idMaladie" INTEGER PRIMARY KEY AUTOINCREMENT,
      "idMembre" INTEGER,
      "nomMembreMaladie" TEXT,
      "typeMaladie" TEXT,
      "dateMaladie" TEXT,
      "lieuHospitalisation" TEXT,
      "observationMaladie" TEXT,
      "idUtilisateur" INTEGER
    );
    INSERT INTO "__maladie_repair" (
      "idMaladie",
      "idMembre",
      "nomMembreMaladie",
      "typeMaladie",
      "dateMaladie",
      "lieuHospitalisation",
      "observationMaladie",
      "idUtilisateur"
    )
    SELECT
      "idMaladie",
      "idMembre",
      "nomMembreMaladie",
      "typeMaladie",
      "dateMaladie",
      "lieuHospitalisation",
      "observationMaladie",
      "idUtilisateur"
    FROM "maladie";
    DROP TABLE "maladie";
    ALTER TABLE "__maladie_repair" RENAME TO "maladie";
    CREATE INDEX IF NOT EXISTS "idx_maladie_utilisateur_sqlite" ON "maladie" ("idUtilisateur");
  `);
};

/**
 * Ajoute les tables et indexes manquants sur une base SQLite deja existante.
 */
const ensureSqliteSchemaUpdated = async (databasePath: string): Promise<void> => {
  const dump = await fs.promises.readFile(TEMPLATE_PATH, "utf-8");
  const { schemaStatements } = convertMysqlDumpToSqliteStatements(dump);
  const database = openDatabase(databasePath);

  try {
    // Ici on n'execute pas les INSERT du dump : on veut seulement
    // completer les tables et indexes manquants sans dupliquer les donnees.
    await executeStatements(database, schemaStatements);
    await ensureMembreAndDecesColumns(database);
    await ensureMembreInscriptionDemandeTable(database);
    await ensureVersetProgrammeTable(database);
    await ensureComptabiliteColumns(database);
    await repairBrokenGalerieTables(database);
    await repairBrokenMaladieTable(database);
  } finally {
    await new Promise<void>((resolve, reject) => {
      database.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve();
      });
    });
  }
};

/**
 * Cree le dossier de travail SQLite s'il n'existe pas.
 */
const ensureSqliteDirectory = async (): Promise<void> => {
  await fs.promises.mkdir(DEFAULT_SQLITE_DIR, { recursive: true });
};

const readActiveSqliteDatabasePath = async (): Promise<string | null> => {
  if (!fs.existsSync(ACTIVE_DB_FILE)) {
    return null;
  }

  try {
    const metadata = JSON.parse(await fs.promises.readFile(ACTIVE_DB_FILE, "utf-8"));
    const databasePath = typeof metadata?.databasePath === "string" ? metadata.databasePath : "";
    return databasePath && fs.existsSync(databasePath) ? databasePath : null;
  } catch (error) {
    console.error("[DB] Impossible de lire la base SQLite active:", error);
    return null;
  }
};

const isDefaultSqliteDatabasePath = (databasePath: string): boolean =>
  path.resolve(databasePath) === path.resolve(DEFAULT_SQLITE_FILE);

const listSqliteDatabasePaths = async (): Promise<string[]> => {
  await ensureSqliteDirectory();

  return (await fs.promises.readdir(DEFAULT_SQLITE_DIR))
    .filter((fileName) => fileName.endsWith(".db"))
    .map((fileName) => path.join(DEFAULT_SQLITE_DIR, fileName));
};

const getPreferredCommunityDatabasePath = async (): Promise<string | null> => {
  const databaseFiles = await listSqliteDatabasePaths();
  const communityDatabases = databaseFiles
    .filter((databasePath) => path.resolve(databasePath) !== path.resolve(DEFAULT_SQLITE_FILE))
    .map((databasePath) => {
      const stats = fs.statSync(databasePath);
      return { databasePath, modifiedAt: stats.mtimeMs };
    })
    .sort((left, right) => right.modifiedAt - left.modifiedAt || left.databasePath.localeCompare(right.databasePath));

  return communityDatabases[0]?.databasePath || null;
};

/**
 * Sauvegarde le chemin de la base SQLite active pour le mode local.
 */
export const setActiveSqliteDatabasePath = async (databasePath: string): Promise<void> => {
  await ensureSqliteDirectory();
  await fs.promises.writeFile(
    ACTIVE_DB_FILE,
    JSON.stringify({ databasePath }, null, 2),
    "utf-8"
  );
};

/**
 * Retourne le chemin de la base SQLite active si elle est connue.
 */
export const getActiveSqliteDatabasePath = async (): Promise<string> => {
  await ensureSqliteDirectory();

  if (process.env.SQLITE_DB_PATH) {
    // Priorite maximale a une base forcee explicitement par variable d'environnement.
    return process.env.SQLITE_DB_PATH;
  }

  const memorizedDatabasePath = await readActiveSqliteDatabasePath();
  if (memorizedDatabasePath && !isDefaultSqliteDatabasePath(memorizedDatabasePath)) {
    // Sinon on relit la derniere base active memorisee par le serveur.
    return memorizedDatabasePath;
  }

  const preferredCommunityDatabasePath = await getPreferredCommunityDatabasePath();
  if (preferredCommunityDatabasePath) {
    // Si une base d'eglise existe deja, elle doit prendre le dessus sur la base locale generique.
    await setActiveSqliteDatabasePath(preferredCommunityDatabasePath);
    return preferredCommunityDatabasePath;
  }

  if (memorizedDatabasePath) {
    return memorizedDatabasePath;
  }

  if (fs.existsSync(DEFAULT_SQLITE_FILE)) {
    // Si aucune base active n'est memorisee, on retombe sur la base locale par defaut.
    return DEFAULT_SQLITE_FILE;
  }

  const databaseFiles = (await fs.promises.readdir(DEFAULT_SQLITE_DIR))
    .filter((fileName) => fileName.endsWith(".db"))
    .sort();

  if (databaseFiles.length > 0) {
    // Dernier filet de securite : prendre la premiere base trouvee dans le dossier.
    return path.join(DEFAULT_SQLITE_DIR, databaseFiles[0]);
  }

  return DEFAULT_SQLITE_FILE;
};

/**
 * Execute une instruction sur une base SQLite puis retourne un resultat proche de MySQL.
 */
const ensureSqliteDatabaseReady = async (databasePath: string): Promise<void> => {
  if (preparedSqliteDatabases.has(databasePath)) {
    return;
  }

  await initializeSqliteDatabase(databasePath);
  preparedSqliteDatabases.add(databasePath);
};

export const executeSqlite = async (
  sql: string,
  params: any[] = [],
  databasePath?: string
): Promise<{ insertId: number; affectedRows: number }> => {
  const resolvedDatabasePath = databasePath || await getActiveSqliteDatabasePath();
  await ensureSqliteDirectory();
  await ensureSqliteDatabaseReady(resolvedDatabasePath);
  await ensureSqliteDatabaseReady(resolvedDatabasePath);

  return new Promise((resolve, reject) => {
    const database = openDatabase(resolvedDatabasePath);
    database.run(sql, params, function runCallback(error: Error | null) {
      if (error) {
        database.close(() => reject(error));
        return;
      }

      // On reconstruit un format proche de MySQL pour limiter les
      // changements dans les fonctions existantes du projet.
      const result = {
        insertId: typeof this.lastID === "number" ? this.lastID : 0,
        affectedRows: typeof this.changes === "number" ? this.changes : 0,
      };

      database.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve(result);
      });
    });
  });
};

/**
 * Execute une requete SELECT sur la base SQLite active.
 */
export const selectSqlite = async (
  sql: string,
  params: any[] = [],
  databasePath?: string
): Promise<any[]> => {
  const resolvedDatabasePath = databasePath || await getActiveSqliteDatabasePath();
  await ensureSqliteDirectory();
  await ensureSqliteDatabaseReady(resolvedDatabasePath);

  return new Promise((resolve, reject) => {
    const database = openDatabase(resolvedDatabasePath);
    database.all(sql, params, (error, rows) => {
      if (error) {
        database.close(() => reject(error));
        return;
      }

      // Les lectures retournent directement le tableau de lignes attendu
      // par la couche metier existante.
      database.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve(rows || []);
      });
    });
  });
};

/**
 * Cree une base SQLite a partir du dump de reference si le fichier n'existe pas.
 */
export const initializeSqliteDatabase = async (databasePath: string): Promise<void> => {
  await ensureSqliteDirectory();

  if (fs.existsSync(databasePath)) {
    // Si la base existe deja, on la migre au schema courant au lieu de la recreer.
    await ensureSqliteSchemaUpdated(databasePath);
    await setActiveSqliteDatabasePath(databasePath);
    return;
  }

  const dump = await fs.promises.readFile(TEMPLATE_PATH, "utf-8");
  const statements = buildFullInitializationStatements(dump);
  const database = openDatabase(databasePath);

  // Ici on initialise une base neuve avec le schema complet et les donnees de reference.
  await executeStatements(database, statements);

  await new Promise<void>((resolve, reject) => {
    database.close((closeError) => {
      if (closeError) {
        reject(closeError);
        return;
      }

      resolve();
    });
  });

  await setActiveSqliteDatabasePath(databasePath);
};

/**
 * Met a jour le schema de toutes les bases SQLite deja presentes dans le dossier local.
 */
export const ensureAllSqliteDatabasesSchemasUpdated = async (): Promise<string[]> => {
  await ensureSqliteDirectory();

  const databaseFiles = (await fs.promises.readdir(DEFAULT_SQLITE_DIR))
    .filter((fileName) => fileName.endsWith(".db"))
    .map((fileName) => path.join(DEFAULT_SQLITE_DIR, fileName));

  for (const databasePath of databaseFiles) {
    // Chaque base locale deja creee est remise a niveau avec le schema courant.
    await ensureSqliteSchemaUpdated(databasePath);
  }

  return databaseFiles;
};

/**
 * Prepare une base locale par defaut au demarrage en mode SQLite.
 */
export const ensureDefaultSqliteDatabase = async (): Promise<string> => {
  await ensureSqliteDirectory();

  const previousActiveDatabasePath = process.env.SQLITE_DB_PATH || await readActiveSqliteDatabasePath();

  if (fs.existsSync(DEFAULT_SQLITE_FILE)) {
    await ensureSqliteSchemaUpdated(DEFAULT_SQLITE_FILE);
  } else {
    await initializeSqliteDatabase(DEFAULT_SQLITE_FILE);
  }

  const preferredCommunityDatabasePath = await getPreferredCommunityDatabasePath();
  const activeDatabasePath =
    previousActiveDatabasePath && !isDefaultSqliteDatabasePath(previousActiveDatabasePath)
      ? previousActiveDatabasePath
      : preferredCommunityDatabasePath || previousActiveDatabasePath || DEFAULT_SQLITE_FILE;

  await setActiveSqliteDatabasePath(activeDatabasePath);
  return activeDatabasePath;
};

/**
 * Construit un chemin de base SQLite local a partir du nom de la communaute.
 */
export const buildSqliteDatabasePath = (communityName: string, idUtilisateur?: number): string => {
  const baseName = sanitizeFileName(communityName || "ma-communaute") || "ma-communaute";
  const fileName = typeof idUtilisateur === "number"
    ? `${baseName}-${idUtilisateur}.db`
    : `${baseName}.db`;

  return path.join(DEFAULT_SQLITE_DIR, fileName);
};

/**
 * Recherche la base locale qui contient l'utilisateur utilise pour se connecter.
 */
export const findSqliteDatabaseForLogin = async (
  nomUtilisateur: string,
  password: string
): Promise<string | null> => {
  await ensureSqliteDirectory();

  const databaseFiles = (await fs.promises.readdir(DEFAULT_SQLITE_DIR))
    .filter((fileName) => fileName.endsWith(".db"))
    .map((fileName) => path.join(DEFAULT_SQLITE_DIR, fileName));

  for (const databasePath of databaseFiles) {
    try {
      // On parcourt les bases locales une par une pour trouver celle
      // qui contient le compte utilise lors de la connexion.
      const rows = await selectSqlite(
        "SELECT idUtilisateur FROM utilisateur WHERE nomUtilisateur = ? AND password = ? LIMIT 1",
        [nomUtilisateur, password],
        databasePath
      );

      if (rows.length > 0) {
        // Des qu'on trouve la bonne base, on la memorise comme base active.
        await setActiveSqliteDatabasePath(databasePath);
        return databasePath;
      }
    } catch (error) {
      console.error(`Erreur lors de la verification SQLite sur ${databasePath}:`, error);
    }
  }
  return null;
};

export default {
  isSqliteMode,
  executeSqlite,
  selectSqlite,
  initializeSqliteDatabase,
  buildSqliteDatabasePath,
  setActiveSqliteDatabasePath,
  getActiveSqliteDatabasePath,
  findSqliteDatabaseForLogin,
  getDatabaseMode,
  getSqliteDirectory,
  getDefaultSqliteDatabasePath,
  ensureDefaultSqliteDatabase,
  ensureAllSqliteDatabasesSchemasUpdated,
  ensureDailySqliteBackup,
  restoreSqliteBackupArchive,
};



