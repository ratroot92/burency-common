const { env } = require("../helpers");
const { Stream } = require("../stream");

const notify = async (notificationData) => 
{
    const notification = {
        ...notificationData,
        service: env("APP_NAME") ?? "",
    }
    // Send notification to Kafka
    const streamServer = new Stream({
        clientId: env("KAFKA_CLIENT_ID"),
        brokers: [env("KAFKA_BROKERS")]
    });
    await streamServer.produce(notification,
    {
        topic: "NOTIFICATIONS.SEND"
    });
}

module.exports = notify;