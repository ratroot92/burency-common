const jwt = require("jsonwebtoken");
const { env } = require("../helpers");

class Jwt 
{
	secret;
	constructor() 
	{
		this.secret = env("TOKEN_SECRET", "x0t0wefw33@2314R23$@4$%!#$634");
	}
	static getToken(payload = {}, options = {}) 
	{
		const token = jwt.sign(
		{
			data: { ...payload },
			iat: Math.floor(Date.now() / 1000) - 30,
			exp: Math.floor(Date.now() / 1000) + 60 * 60,
			validFor: options.validFor ?? false,
			device_fingerprint: options.device_fingerprint
		},
		env("TOKEN_SECRET", "x0t0wefw33@2314R23$@4$%!#$634")
		);

		return token;
	}
	static verifyToken(token, detectUser) 
	{
		try 
		{
			const decodedToken = jwt.verify(token, env("TOKEN_SECRET", "x0t0wefw33@2314R23$@4$%!#$634"));

			// Token is only valid for the creating device
			if(decodedToken.device_fingerprint !== detectUser.device_fingerprint)
				return false;
			else
				return decodedToken;
		}
		catch (error)
		{
			return false;
		}
	}
}

module.exports = Jwt;