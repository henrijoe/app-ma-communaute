import express, { Router } from "express";
import fs from "fs";
import os from "os";
import path from "path";

import controllers from "./controllers";

const multer = require("multer");

const desktopControlRouter: Router = express.Router();
const sqliteRestoreUploadDirectory = path.join(os.tmpdir(), "ma-communaute-sqlite-restore");
const sqliteRestoreMaxFileSizeMb = Number(process.env.SQLITE_RESTORE_MAX_FILE_SIZE_MB || 500);

fs.mkdirSync(sqliteRestoreUploadDirectory, { recursive: true });

const sqliteRestoreUpload = multer({
  dest: sqliteRestoreUploadDirectory,
  limits: {
    fileSize: Math.max(1, sqliteRestoreMaxFileSizeMb) * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const isZip = path.extname(file.originalname || "").toLowerCase() === ".zip";

    if (!isZip) {
      callback(new Error("Veuillez selectionner une sauvegarde au format .zip."));
      return;
    }

    callback(null, true);
  },
});
const handleSqliteRestoreUpload = (req, res, next) => {
  sqliteRestoreUpload.single("backup")(req, res, (error) => {
    if (error) {
      res.status(400).send({
        status: 0,
        error: {
          name: "UPLOAD_ERROR",
          message: error.message || "Impossible de charger le fichier de sauvegarde.",
        },
      });
      return;
    }

    next();
  });
};

desktopControlRouter.get("/desktop-control/status", controllers.getDesktopLicenseStatus);
desktopControlRouter.post("/desktop-control/unlock", controllers.unlockDesktopLicense);
desktopControlRouter.post("/desktop-control/rebind-machine", controllers.rebindDesktopLicenseMachine);
desktopControlRouter.post("/desktop-control/unlock-code", controllers.unlockDesktopLicenseWithCode);
desktopControlRouter.post("/desktop-control/unlock-codes/export", controllers.exportPendingDesktopUnlockCodes);
desktopControlRouter.post("/desktop-control/unlock-codes/generate", controllers.generateDesktopUnlockCodes);
desktopControlRouter.post(
  "/desktop-control/sqlite-backups/restore",
  handleSqliteRestoreUpload,
  controllers.restoreSqliteBackup
);
desktopControlRouter.get("/server-info", controllers.getServerNetworkInfo);

export default desktopControlRouter;
