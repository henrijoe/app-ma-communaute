import express, { Router } from "express";
import controllers from "./controllers";
import validator from "./validator";

const membreRouter: Router = express.Router();

membreRouter.post("/inserermembre", /* validator.ajouterMembreValidator(), */ controllers.ajouterMembre);
membreRouter.get("/listemembre", controllers.recupMembre);
membreRouter.post("/supprimermembre", controllers.supprimerMembre);
membreRouter.post("/modifiermembre", /* validator.modifierMembreValidator(), */ controllers.modifierMembre);
membreRouter.get("/recupmembrebyutilisateur/:idUtilisateur", controllers.recupMembreByIdUtilsateur);

export default membreRouter;