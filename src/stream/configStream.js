const { Kafka } = require('kafkajs');
const path = require('path');
const fs = require('fs');
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);
class ConfigStream {
    kafka;
    clientId;
    brokers;
    producer;
    consumer;
    constructor() {
        this.clientId = process.env.KAFKA_CLIENT_ID;
        this.brokers = process.env.KAFKA_BROKERS.split(',');
        this.connect();
    }
    logger(data) {
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'local') {
            console.log('-------------------------------');
            console.log(data);
            console.log('-------------------------------');
        }
    }
    connect() {
        this.logger('ConfigStream connect');
        this.kafka = new Kafka({
            clientId: this.clientId,
            brokers: this.brokers,
            requestTimeout: 5000,
            retry: {
                initialRetryTime: 100,
                retries: 8,
            },
        });
        this.producer = this.kafka.producer();
    }
    async registerServices(options = {}) {
        this.logger('ConfigStream registerServices');
        if (!options.services) {
            options.services = JSON.parse(await readFileAsync(process.cwd() + '/src/config/services.json', 'utf-8'));
        }
        this.consumer = this.kafka.consumer({ groupId: this.clientId + Math.random() });
        await this.consumer.connect();
        for (const [key, service] of Object.entries(options.services)) {
            for (const [key2, operations] of Object.entries(service.operations)) {
                var topic = key + '.' + key2;
                await this.consumer.subscribe({ topic: topic, fromBeginning: false });
            }
        }
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const key = message.key?.toString();
                    const messageReceived = message.value?.toString();
                    var payload = JSON.parse(messageReceived);
                    var topic = topic.split('.');
                    var serviceProviderName = options.services[topic[0]]?.provider;
                    if (!serviceProviderName) return;
                    var serviceOperation = options.services[topic[0]].operations[topic[1]];
                    const serviceProviderPath = path.resolve(
                        __dirname,
                        '../../../../../src/app/services',
                        serviceProviderName
                    );
                    const serviceProvider = require(serviceProviderPath);
                    serviceProvider[serviceOperation.hanlder](payload, {
                        topic: topic[0] + '.' + topic[1],
                        key: key,
                    });
                } catch (error) {}
            },
        });
    }
}
module.exports = ConfigStream;
