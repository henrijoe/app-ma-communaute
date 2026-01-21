import express, { Router } from "express";
import controllers from "./controllers";
import validator from "./validator";

const departementRouter: Router = express.Router();

departementRouter.post("/insererdepartement", /* validator.ajouterDepartementValidator(),*/ controllers.ajouterDepartement);
departementRouter.get("/listedepartement", controllers.recupDepartement);
departementRouter.post("/supprimerdepartement", controllers.supprimerDepartement);
departementRouter.post("/modifierdepartement", /* validator.modifierDepartementValidator(), */ controllers.modifierDepartement);
departementRouter.get("/recupdepartementbyutilisateur/:idUtilisateur", controllers.recupDepartementByIdUtilsateur);

export default departementRouter;