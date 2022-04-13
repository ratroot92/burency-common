class AppError extends Error {

    constructor(data) {
		super(data.message);
		this.statusCode = data.statusCode;
		this.data = data.data ?? {};
		this.accessToken = data.accessToken ?? null;
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}

  }
  
  module.exports = AppError;