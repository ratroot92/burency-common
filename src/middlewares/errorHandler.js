const { Response } = require("../helpers");

const errorHandler = function (err, req, res, next) 
{
    res.json( Response.exception({ message: err.message }) );
}

module.exports = errorHandler;