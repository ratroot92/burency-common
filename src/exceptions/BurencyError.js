class BurencyError
{
	constructor(code, message, data) 
	{
		this.code = code;
		this.message = message;
		this.data = data;
	}
	/**
	 *
	 * @returns object
	 */
	static handle({code = 500, message = "", data = {} }) 
	{
		return new BurencyError(code, message, data);
	}
}

module.exports = BurencyError;
