const JWT = require("../utils/jwt");
const { Response, DetectUser } = require("../helpers");

const auth = function (options = {}) 
{
    return async (req, res, next) => 
    {
        const detectUser = new DetectUser({req, headers: req.headers});
        const verifiedToken = JWT.verifyToken(req.headers.accesstoken, detectUser);
    
        // 1. Check if token is valid
        if(!verifiedToken)
        {
            return res.status(401).json( Response.unauthorize({ message: "Invalid token!"}) );
        }
    
        // 2. Check if token is valid for certain route
        if(verifiedToken.validFor || options?.checkValidFor)
        {
            const path = req.originalUrl.replace(/^\/|\/$/g, '');
            if(path !== verifiedToken.validFor)
                return res.status(401).json( Response.unauthorize({ message: "Token is not valid for this route."}) );
        }
    
        // // 3. Check if token is not expired
        // if( verifiedToken.exp <= Date.now() )
        //     res.json( Response.unauthorize({ message: "Token has been expired."}) );
    
        // 4. Permission Check
        // Response.forbidden 403

        // Attach user with the request
        req.authUser = verifiedToken.data;
        
        var oldSend = res.send;
        res.send = function(data)
        {
            data = JSON.parse(data);
            if(data?.accessToken === null && req.authUser?.authenticated === true)
            {
                const accessToken =  JWT.getToken({ ...req.authUser }, { device_fingerprint: detectUser.device_fingerprint });
                data.accessToken = accessToken;
            }
            res.send = oldSend // set function back to avoid the 'double-send'
            return res.send(data) // just call as normal with data
        }
        next();
    }
}

module.exports = auth;