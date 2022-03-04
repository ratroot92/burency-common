class Response
{
    /**
     * Request has been fulfilled successfully
     * @returns object
     */
    static success(options = {})
    {
        return {
            status: 200,
            message: options.message ?? "Success",
            data: options.data ?? {},
            accessToken: options.accessToken ?? null
        };
    }
    
    /**
     * Invalid request contents
     * @returns object
     */
    static error(options = {})
    {
        return {
            status: 400,
            message: options.message ?? "Error",
            data: options.data ?? {},
            accessToken: options.accessToken ?? null
        };
    }
    
    /**
     * The client is not authenticated
     * @returns object
     */
    static unauthorize(options = {})
    {
        return {
            status: 401,
            message: options.message ?? "Unauthorized",
            data: options.data ?? {},
            accessToken: options.accessToken ?? null
        };
    }
    
    /**
     * The client don't have permission for this action
     * @returns object
     */
    static forbidded(options = {})
    {
        return {
            status: 403,
            message: options.message ?? "Forbidded",
            data: options.data ?? {},
            accessToken: options.accessToken ?? null
        };
    }
    
    /**
     * The user has sent too many requests in a given amount of time
     * @returns object
     */
    static throttle(options = {})
    {
        return {
            status: 429,
            message: options.message ?? "Too many requests.",
            data: options.data ?? {},
            accessToken: options.accessToken ?? null
        };
    }
    
    /**
     * The server has encountered a situation it does not know how to handle
     * @returns object
     */
    static exception(options = {})
    {
        return {
            status: 500,
            message: options.message ?? "Internal server error.",
            data: options.data ?? {},
            accessToken: options.accessToken ?? null
        };
    }
    
    /**
     * Validation error in payload
     * @returns object
     */
    static validation(options = {})
    {
        return {
            status: 422,
            message: options.message ?? "Unprocessed entity.",
            data: options.data ?? {},
            accessToken: options.accessToken ?? null
        };
    }
}

module.exports = Response;