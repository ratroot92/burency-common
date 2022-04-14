class AppError extends Error {

    constructor(data) {  
		super(data.message);
		this.code = data.code;
		this.data = data.data ?? {};
		this.accessToken = data.accessToken ?? null;
	}
  }
  
  module.exports = AppError;