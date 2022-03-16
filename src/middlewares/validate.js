const path = require("path");
const rules = require(path.join(process.cwd(), "/src/app/validations"));
const { Response } = require("../helpers");

const validate = function (req, res, next) 
{
    var endpoint = req.originalUrl.replace(/^\/|\/$/g, '');
    endpoint = endpoint.split("/");

    if(endpoint[1])
        endpoint = req.method+":"+endpoint[0]+"/*";
    else
        endpoint = req.method+":"+endpoint[0];

    const schema = rules[endpoint] ?? false;
    if(schema)
    {
        const validated = schema.validate(req.body);
        if(validated["error"] !== undefined)
        {
            var errors = [];
            validated.error.details.forEach(detail => {
                errors.push({
                    path: detail.context.label,
                    field: detail.context.key,
                    message: detail.message,
                    map: detail.path,
                    type: detail.type,
                    _original: validated.error._original
                });
            });
            return res.json( Response.validation({ data: { errors } }) );
        }
    }

    return next();
}

module.exports = validate;