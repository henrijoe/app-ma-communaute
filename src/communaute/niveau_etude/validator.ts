import { ajvValidator } from "../../helpers/ajvValidator";

const ajouterNiveauEtudeValidator = () => {

    const schema = {
        type: "object",
        properties: {
            idNiveauEtude: { type: "number", nullable: false, maximum: 99999999 },
            libelleNiveauEtude: { type: "string",nullable: false, },
        },
        required: ["libelleNiveauEtude"],
        additionalProperties: false
    }
    return ajvValidator(schema);
};


export default {
    ajouterNiveauEtudeValidator,
}