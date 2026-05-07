import express, { Router } from "express";

import controllers from "./controllers";

const desktopControlRouter: Router = express.Router();

desktopControlRouter.get("/desktop-control/status", controllers.getDesktopLicenseStatus);
desktopControlRouter.post("/desktop-control/unlock", controllers.unlockDesktopLicense);
desktopControlRouter.post("/desktop-control/rebind-machine", controllers.rebindDesktopLicenseMachine);
desktopControlRouter.post("/desktop-control/unlock-code", controllers.unlockDesktopLicenseWithCode);
desktopControlRouter.post("/desktop-control/unlock-codes/export", controllers.exportPendingDesktopUnlockCodes);
desktopControlRouter.post("/desktop-control/unlock-codes/generate", controllers.generateDesktopUnlockCodes);
desktopControlRouter.get("/server-info", controllers.getServerNetworkInfo);

export default desktopControlRouter;
