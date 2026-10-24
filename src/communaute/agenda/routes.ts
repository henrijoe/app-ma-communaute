import express, { Router } from "express";
import controllers from "./controllers";

const agendaRouter: Router = express.Router();

agendaRouter.post("/insereragenda", controllers.ajouterAgenda);
agendaRouter.get("/recupagendabyutilisateur/:idUtilisateur", controllers.recupAgendaByIdUtilsateur);
agendaRouter.post("/modifieragenda", controllers.modifierAgenda);
agendaRouter.post("/supprimeragenda", controllers.supprimerAgenda);

export default agendaRouter;
