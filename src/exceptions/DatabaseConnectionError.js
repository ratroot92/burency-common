class DatabaseConnectionError
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
		return new DatabaseConnectionError(code, message, data);
	}
}

module.exports = DatabaseConnectionError;
