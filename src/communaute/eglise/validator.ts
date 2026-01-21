import { ajvValidator } from "../../helpers/ajvValidator";


const ajouterEgliseValidator = () => {

    const schema = {
        type: "object",
        properties: {
            nomEglise: { type: "string", nullable: false, },
            idComptabilite: { type: "number", nullable: false, maximum: 999},
            idUtilisateur: { type: "number", nullable: false, maximum: 999},
        },
        required: ["nomEglise"],
        additionalProperties: false
    }
    return ajvValidator(schema);
    
};


export default {
    ajouterEgliseValidator,
}