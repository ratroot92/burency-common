const { env } = require("../helpers");
const { Stream } = require("../stream");
const { v4: uuidv4 } = require('uuid');
const DetectUser = require("../helpers/DetectUser");

const resDotSendInterceptor = (res, send) => (content) => {
    res.contentBody = content;
    res.send = send;
    res.send(content);
};

const logger = function (req, res, next) {
    // Store this Log in the database
    console.log("Route invoked: " + req.originalUrl)
    var detect_user = new DetectUser({req, headers: req.headers});

    req.startTime = performance.now();
    req.coRelationId = uuidv4();
    res.send = resDotSendInterceptor(res, res.send);   // Intercept response send method

    res.on('finish', async () => {
        const { statusCode, statusMessage, contentBody } = res;
        if (contentBody?.status >= 200 && contentBody?.status < 400) {
            const { rawHeaders, method, originalUrl, startTime, coRelationId } = req;
            var ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
            var userEmail = req.authUser?.user.email ? req.authUser?.user.email : req.authUser?.user.phone;
            var user_id = req.authUser?.user._id;
            var processingTime = performance.now() - req.startTime;
            var level = "info";
            var log_type = "REST_API";
            var service = env("APP_NAME");
            const logData = {
                ...{ request: { rawHeaders, method, originalUrl, ipAddress, startTime } },
                ...{ response: { statusCode, statusMessage, contentBody } },
                processingTime, level, log_type, service, coRelationId, user: { id: user_id, email: userEmail, about_user: detect_user }
            }
            //send this info to kafka
            const streamServer = new Stream({
                clientId: env("KAFKA_CLIENT_ID"),
                brokers: [env("KAFKA_BROKERS")]
            });
            await streamServer.produce(logData,
                {
                    topic: "LOG_INFO.REST_API"
                });
        }
    });
    next()
}

module.exports = logger;