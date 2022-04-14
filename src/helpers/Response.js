const AppError = require("../exceptions/ApiError");

class Response {
  /**
   * Request has been fulfilled successfully
   * @returns object
   */
  static success(options = {}) {
    return {
      status: options.status??200,
      message: options.message ?? "Success",
      data: options.data ?? {},
      accessToken: options.accessToken ?? null,
    }; 
  }

  /**
   * Invalid request contents
   * @returns object
   */
  static error(options = {}) {
    return new AppError({
        status:options.status?? 400,
        message:options.message ?? "Invalid data",
        data:options.data,
        accessToken:options.accessToken
      });
  }

  /**
   * The client is not authenticated
   * @returns object
   */
  static unauthorize(options = {}) {
    return new AppError({
      status:options.status?? 401,
      message:options.message ?? "Unauthorized",
      data:options.data,
      accessToken:options.accessToken
    });
  }

  /**
   * The client don't have permission for this action
   * @returns object
   */
  static forbidden(options = {}) {
    return new AppError({
      status:options.status?? 403,
      message:options.message ?? "Forbidden",
      data:options.data,
      accessToken:options.accessToken
    });
  }

  /**
   * The client don't have permission for this action
   * @returns object
   */
  static notFound(options = {}) {
    return new AppError({
      status:options.status?? 404,
      message:options.message ?? "Invalid Route",
      data:options.data,
      accessToken:options.accessToken
    });
  }

  /**
   * The user has sent too many requests in a given amount of time
   * @returns object
   */
  static throttle(options = {}) {
    return new AppError({
      status:options.status?? 429,
      message:options.message ?? "Too many requests.",
      data:options.data,
      accessToken:options.accessToken
    });
  }

  /**
   * The server has encountered a situation it does not know how to handle
   * @returns object
   */
  static exception(options = {}) {
    return new AppError({
      status:options.status?? 500,
      message:options.message ?? "Internal server error.",
    });
  }

  /**
   * Validation error in payload
   * @returns object
   */
  static validation(options = {}) {
    return new AppError({
      status:options.status?? 422,
      message:options.message ?? "Unprocessed entity.",
      data:options.data,
      accessToken:options.accessToken
    });
  }

}

module.exports = Response;
