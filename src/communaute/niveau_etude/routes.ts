import express, { Router } from "express";
import controllers from "./controllers";
import validator from "./validator";

const niveauRouter: Router = express.Router();

niveauRouter.post("/ajouterniveau",validator.ajouterNiveauEtudeValidator(), controllers.ajouterNiveauEtude);
niveauRouter.get("/listeniveau", controllers.obtenirIdNiveauEtude);
niveauRouter.post("/supprimerniveau/:id", controllers.supprimerNiveau);
niveauRouter.post("/modifierniveau/:id",validator.ajouterNiveauEtudeValidator(), controllers.modifierNiveau);

export default niveauRouter;