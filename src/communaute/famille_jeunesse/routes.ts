import express, { Router } from "express";
import controllers from "./controllers";
import membresFamilleRouter from "./membres";

const familleJeunesseRouter: Router = express.Router();

familleJeunesseRouter.post("/insererfamillejeunesse", controllers.ajouterFamilleJeunesse);
familleJeunesseRouter.get("/listefamillejeunesse", controllers.recupFamilleJeunesse);
familleJeunesseRouter.get(
  "/recupfamillejeunessebyutilisateur/:idUtilisateur",
  controllers.recupFamilleJeunesseByIdUtilisateur
);
familleJeunesseRouter.post("/modifierfamillejeunesse", controllers.modifierFamilleJeunesse);
familleJeunesseRouter.post("/supprimerfamillejeunesse", controllers.supprimerFamilleJeunesse);

// Membres rattachés à chaque famille, pour la feuille imprimée de la famille.
familleJeunesseRouter.use(membresFamilleRouter);

export default familleJeunesseRouter;
