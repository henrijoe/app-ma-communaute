import express, { Router } from "express";

import controllers from "./controllers";

const desktopControlRouter: Router = express.Router();

desktopControlRouter.get("/desktop-control/status", controllers.getDesktopLicenseStatus);
desktopControlRouter.post("/desktop-control/unlock", controllers.unlockDesktopLicense);
desktopControlRouter.get("/server-info", controllers.getServerNetworkInfo);

export default desktopControlRouter;
