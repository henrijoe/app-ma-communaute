import express, { Router } from "express";
import controllers from "./controllers";

const familleJeunesseRouter: Router = express.Router();

familleJeunesseRouter.post("/insererfamillejeunesse", controllers.ajouterFamilleJeunesse);
familleJeunesseRouter.get("/listefamillejeunesse", controllers.recupFamilleJeunesse);
familleJeunesseRouter.get(
  "/recupfamillejeunessebyutilisateur/:idUtilisateur",
  controllers.recupFamilleJeunesseByIdUtilisateur
);
familleJeunesseRouter.post("/modifierfamillejeunesse", controllers.modifierFamilleJeunesse);
familleJeunesseRouter.post("/supprimerfamillejeunesse", controllers.supprimerFamilleJeunesse);

export default familleJeunesseRouter;
