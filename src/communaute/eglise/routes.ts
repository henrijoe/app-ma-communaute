import express, { Router } from "express";
import controllers from "./controllers";
import validator from "./validator";


const egliseRouter: Router = express.Router();

egliseRouter.post("/inserereglise", validator.ajouterEgliseValidator(), controllers.ajouterEglise);
egliseRouter.get("/listeeglise", controllers.recupEglise);
egliseRouter.post("/supprimereglise/:id", controllers.supprimerEglise);
egliseRouter.post("/modifiereglise/:id", controllers.modifierEglise);


export default egliseRouter;