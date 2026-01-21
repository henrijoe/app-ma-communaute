import express, { Router } from "express";
import controllers from "./controllers";
import validator from "./validator";

const domaineActiviteRouter: Router = express.Router();

domaineActiviteRouter.post("/ajouterdomaineactivite", validator.ajouterDomaineActiviteValidator(), controllers.ajouterDomaineActivite);
domaineActiviteRouter.get("/listedomaineactivite", controllers.obtenirDomaineActivite);
domaineActiviteRouter.post("/supprimerdomaineactivite/:id", controllers.supprimerDomaineActivite);
domaineActiviteRouter.post("/modifierdomaineactivite/:id", controllers.modifierDomaineActivite);

export default domaineActiviteRouter;