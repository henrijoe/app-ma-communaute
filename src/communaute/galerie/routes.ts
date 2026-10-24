import express, { Router } from "express";
import controllers from "./controllers";

const galerieRouter: Router = express.Router();

galerieRouter.post("/inserergalerie", controllers.ajouterGalerie);
galerieRouter.get("/recupgaleriebyutilisateur/:idUtilisateur", controllers.recupGaleriesByUtilisateur);
galerieRouter.post("/modifiergalerie", controllers.modifierGalerie);
galerieRouter.post("/supprimergalerie", controllers.supprimerGalerie);
galerieRouter.get("/recupimagesgalerie/:idGalerie", controllers.recupImagesGalerie);
galerieRouter.post("/ajouterimagesgalerie", controllers.ajouterImagesGalerie);
galerieRouter.post("/modifierimagegalerie", controllers.modifierImageGalerie);
galerieRouter.post("/definircouverturegalerie", controllers.definirCouvertureGalerie);
galerieRouter.post("/supprimerimagegalerie", controllers.supprimerImageGalerie);
galerieRouter.get("/telechargergalerie/:idGalerie", controllers.telechargerGalerie);

export default galerieRouter;
