class AppError extends Error 
{
    constructor(data) 
	{  
		super(data.message);
		this.status = data.status;
		this.message = data.message ?? {};
		this.data = data.data ?? {};
		this.accessToken = data.accessToken ?? null;
	}
}

module.exports = AppError;