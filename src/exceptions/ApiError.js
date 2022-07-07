class AppError extends Error 
{
    constructor(data) 
	{  
		super(data.message);

		this.status = data.status;
		this.message = data.message ?? {};
		this.data = data.data ?? {};
		this.accessToken = data.accessToken ?? null;
		this.isOperational = data.isOperational ?? true;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = AppError;