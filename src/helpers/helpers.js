const getPath = (fullUrl) =>
{
    return fullUrl.replace(/^\/|\/$/g, "");
}
const env = (key, defaultValue) =>
{
    if(!key in process.env)
    {
        if(defaultValue) return defaultValue;
        throw Error(`${key} not found in ENV variables!`);
    }

    // Access Cache if enabled

    return process.env[key];
}
const exists = async (value, options) =>
{
    const model = path.resolve(__dirname, "../models", options.model);
    const Model = require(model);
    var fieldName = options.field;
    const modelQuery = await Model.find({[fieldName]: value});
    if (!modelQuery.length) {
        throw new Joi.ValidationError(
            "ValidationError",
            [
                {
                    message: `${options.model} do not exist`,
                    path: [options.model],
                //     type: "",
                //     context: {
                //         key: options.model,
                //         label: options.model,
                //         value,
                //     },
                },
            ],
            value
        );
    } 
    return value;
    
}

module.exports = {
    getPath,
    env
}