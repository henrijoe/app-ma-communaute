import { ajvValidator } from "../../helpers/ajvValidator";

const ajouterDomaineActiviteValidator = () => {

    const schema = {
        type: "object",
        properties: {
            idDomaineActivite: { type: "number", nullable: false, maximum: 99999999 },
            libelleDomaineActivite: { type: "string",nullable: false, },
        },
        required: ["libelleDomaineActivite"],
        additionalProperties: false
    }
    return ajvValidator(schema);
};


export default {
    ajouterDomaineActiviteValidator,
}