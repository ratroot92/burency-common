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
            return res.json( Response.validation({ data: validated.error}) );
        }
    }

    return next();
}

module.exports = validate;