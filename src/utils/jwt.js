const jwt = require("jsonwebtoken");

class Jwt 
{
	secret;
	constructor() 
	{
		this.secret = process.env.TOKEN_SECRET ?? "x0t0wefw33@2314R23$@4$%!#$634";
	}
	static getToken(payload = {}, options = {}) 
	{
		const token = jwt.sign(
		{
			data: { ...payload },
			iat: Math.floor(Date.now() / 1000) - 30,
			exp: Math.floor(Date.now() / 1000) + 60 * 60,
			validFor: options.validFor ?? false,
		},
		process.env.TOKEN_SECRET ?? "x0t0wefw33@2314R23$@4$%!#$634"
		);

		return token;
	}
	static verifyToken(token) 
	{
		try 
		{
			return jwt.verify(token, process.env.TOKEN_SECRET ?? "x0t0wefw33@2314R23$@4$%!#$634");
		}
		catch (error)
		{
			return false;
		}
	}
}

module.exports = Jwt;