import express, { Router } from "express";

import controllers from "./controllers";

const cotisationRouter: Router = express.Router();

// "byutilisateur/" dans l'adresse : c'est ce segment que le contrôle d'accès reconnaît
// pour vérifier que le compte connecté lit bien les données de son église.
cotisationRouter.get("/autrescotisations/byutilisateur/:idUtilisateur", controllers.recupCotisations);
cotisationRouter.post("/insererautrecotisation", controllers.ajouterCotisation);
cotisationRouter.post("/modifierautrecotisation", controllers.modifierCotisation);
cotisationRouter.post("/supprimerautrecotisation", controllers.supprimerCotisation);

export default cotisationRouter;
