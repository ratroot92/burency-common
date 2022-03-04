const ConfigStream = require('./configStream');

class Stream extends ConfigStream
{
    constructor(options)
    {
        super(options);
    }
    
    /**
     * Produce a message to Kafka
     * @param {*} payload 
     * @param {*} options 
     * @returns Promise
     */
    async produce(payload = {}, options = {})
    {
        var payload = JSON.stringify(payload);

        await this.producer.connect();
        const kafkaResp = await this.producer.send({
            topic: options.topic,
            messages: [{
                key: options.key ?? null,
                value: payload
            }],
            acks: options.acks ?? -1,
            timeout: options.timeout ?? 30000
        })
        await this.producer.disconnect();
        return kafkaResp;
    }

    /**
     * Consume or listen to recent messges in kafka
     * subscribe to a specific topic
     */
    async consume(options = {})
    {
        await consumer.connect();
        await consumer.subscribe({ topic: options.topic, fromBeginning: options.fromBeginning ?? true })
        
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log({
                    value: message.value.toString(),
                })
            },
        });
        await consumer.disconnect();
    }

}

module.exports = Stream;