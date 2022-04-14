class AppError extends Error {

    constructor(data) {  
		super(data.message);
		this.status = data.status;
		this.data = data.data ?? {};
		this.accessToken = data.accessToken ?? null;
	}
  }
  
  module.exports = AppError;