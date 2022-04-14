const JWT = require("../utils/jwt");
const { Response } = require("../helpers");

const authenticated = async (req, res, next) => 
{
    const verifiedToken = JWT.verifyToken(req.headers.accesstoken);

    // 1. Check if token is valid
    if(!verifiedToken)
    {
        return res.status(401).json( Response.unauthorize({ message: "Invalid token!"}) );
    }

    // 2. Check if token is valid for certain route
    if(verifiedToken.validFor)
    {
        const path = req.originalUrl.replace(/^\/|\/$/g, '');
        if(path !== verifiedToken.validFor)
            return res.status(401).json( Response.unauthorize({ message: "Token is not valid for this route."}) );
    }

    // // 3. Check if token is not expired
    // if( verifiedToken.exp <= Date.now() )
    //     res.json( Response.unauthorize({ message: "Token has been expired."}) );

    // Attach user with the request
    req.authUser = verifiedToken.data;
    
    var oldSend = res.send;
    res.send = function(data)
    {
        data = JSON.parse(data);
        if(data.accessToken === null && req.authUser?.authenticated === true)
        {
            const accessToken =  JWT.getToken({ ...req.authUser });
            data.accessToken = accessToken;
        }
        res.send = oldSend // set function back to avoid the 'double-send'
        return res.send(data) // just call as normal with data
    }
    next();
}

module.exports = authenticated;