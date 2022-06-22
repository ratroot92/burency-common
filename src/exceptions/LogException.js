const { Stream } = require("../stream");
const { env } = require("../helpers");
const DetectUser = require("../helpers/DetectUser");


class LogException {
    static async log_exception(req, error) {
        var detect_user = new DetectUser({req, headers: req.headers});
        const { rawHeaders, method, originalUrl, coRelationId } = req;
        var userEmail = req.authUser?.user.email ? req.authUser?.user.email : req.authUser?.user.phone;
        var user_id = req.authUser?.user._id;

        const logData = {
            coRelationId, level: "error", log_type: "REST_API", service: env("APP_NAME"), user: { id: user_id, email: userEmail, about_user: detect_user },
            ...{ request: { rawHeaders, method, originalUrl } }, processingTime: performance.now() - req?.startTime,
            ...{
                error: {
                    message: error.message || "Something went wrong",
                    stack_trace: error.stack || error
                }
            }
        }
        const streamServer = new Stream({
            clientId: env("KAFKA_CLIENT_ID"),
            brokers: [env("KAFKA_BROKERS")]
        });
        await streamServer.produce(logData,
            {
                topic: "LOG_ERROR.REST_API"
            });
    }
    static async log_uncaught(error) {

        const logData = {
            level: "exception", log_type: "REST_API", service: env("APP_NAME"),
            ...{
                error: {
                    message: error.message || "Something went wrong",
                    stack_trace: error.stack || error
                }
            }
        }
        const streamServer = new Stream({
            clientId: env("KAFKA_CLIENT_ID"),
            brokers: [env("KAFKA_BROKERS")]
        });
        await streamServer.produce(logData,
            {
                topic: "LOG_EXCEPTION.REST_API"
            });
    }

}

module.exports = LogException;