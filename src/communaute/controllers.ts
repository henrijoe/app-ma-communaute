import { Request, Response, Errback } from "express";
import service from "./service";

const getDataEglise = (req: any, res: Response) => {

    const {idUtilisateur} = req.params
    console.log("🚀 ~ file: controllers.ts:7 ~ getDataEglise ~ idUtilisateur:", idUtilisateur)
    service
        .getDataEglise(idUtilisateur)
        .then((result: any) => {
            // console.log("🚀 ~ file: controllers.ts:10 ~ .then ~ result:", result)
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

export default {
    getDataEglise,
}
