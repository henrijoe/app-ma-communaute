import express, { Router } from "express";
import controllers from "./controllers";

const maladieRouter: Router = express.Router();

maladieRouter.post("/inserermaladie", controllers.ajouterMaladie);
maladieRouter.get("/listemaladie", controllers.recupMaladie);
maladieRouter.post("/supprimermaladie", controllers.supprimerMaladie);
maladieRouter.post("/modifiermaladie", controllers.modifierMaladie);
maladieRouter.get("/recupmaladiebyutilisateur/:idUtilisateur", controllers.recupMaladieByIdUtilsateur);

export default maladieRouter;
