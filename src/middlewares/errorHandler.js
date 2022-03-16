const { 
    DatabaseConnectionError, ApiError, BurencyError
} = require("../exceptions");
const { Response } = require("../helpers");

const errorHandler = function (err, req, res, next) 
{
    if(err instanceof DatabaseConnectionError)
    {
        return res.json( Response.custom({  ...err }) );
    }
    else if(err instanceof ApiError)
    {
        return res.json( Response.custom({  ...err }) );
    }
    else if(err instanceof BurencyError)
    {
        return res.json( Response.custom({  ...err }) );
    }
    return res.json( Response.custom() );

    // process.on('uncaughtException', (error) => {
    //     errorHandler.handleError(error);
    //     if (!errorHandler.isTrustedError(error)) {
    //       process.exit(1);
    //     }
    // });
}

module.exports = errorHandler;