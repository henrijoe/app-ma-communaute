import { ajvValidator } from "../../helpers/ajvValidator";

const ajouterComptabiliteValidator = () => {

    const schema = {
        type: "object",
        properties: {
            nomComptabilite: { type: "string", nullable: false, },
            entreeComptabilite: { type: "number", nullable: false,  maximum: 99999999},
            sortieComptabilite: { type: "number", nullable: false, maximum: 99999999 },
            dateComptabilite: { type: "string", oneOf: [{ format: "date" }, {format: "date-time"}], nullable: false, },
            observationComptabilite: { type: "string", nullable: false, },
            idUtilisateur: { type: "number", nullable: false, maximum: 999},
        },
        required: ["nomComptabilite", "entreeComptabilite", "dateComptabilite"],
        additionalProperties: false
    }
    return ajvValidator(schema);
    
};


export default {
    ajouterComptabiliteValidator,
}