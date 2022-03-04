const logger = function (req, res, next) 
{
    // Store this Log in the database
    console.log("Route invoked: "+req.originalUrl)
    next()
}

module.exports = logger;