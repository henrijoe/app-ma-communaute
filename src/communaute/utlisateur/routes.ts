import express, { Router } from "express";
import controllers from "./controllers";

const utilisateurRouter: Router = express.Router();

utilisateurRouter.post("/ajouterutilisateur", controllers.ajouterUtilisateur);
utilisateurRouter.get("/listeutilisateur", controllers.recupUtilisateur);
utilisateurRouter.post("/supprimerutilisateur", controllers.supprimerUtilisateur);
utilisateurRouter.post("/modifierutilisateur", controllers.modifierUtilisateur);
utilisateurRouter.post("/connexionutilisateur", controllers.connexionUtilisateur);
utilisateurRouter.post("/login", controllers.login);

export default utilisateurRouter;