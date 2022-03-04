const { Kafka } = require('kafkajs');

const path = require("path");
const fs = require("fs");

class ConfigStream
{
    kafka;
    clientId;
    brokers;
    producer;
    consumer;

    constructor(options)
    {
        this.clientId = options.clientId;
        this.brokers = options.brokers;
        this.connect();
    }
    connect()
    {
        this.kafka = new Kafka({
            clientId: this.clientId,
            brokers: this.brokers
        });
        this.producer = this.kafka.producer();
    }
    async registerServices(options = {})
    {
        this.consumer = this.kafka.consumer({ groupId: options.gorupId+Math.random() });
        await this.consumer.connect();
        
        for (const [key, service] of Object.entries(options.services)) 
        {
            for (const [key2, operations] of Object.entries(service.operations)) 
            {
                var topic = key+"."+key2;
                await this.consumer.subscribe({ topic: topic, fromBeginning: false });
            }
        }
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                
                try 
                {
                    console.log("Event received...", topic);
                    const key = message.key?.toString();
                    const messageReceived = message.value?.toString();
                    var payload = JSON.parse(messageReceived);
                    
                    var topic = topic.split(".");
                    var serviceProviderName = options.services[topic[0]]?.provider;
                    if(!serviceProviderName)
                        return;

                    var serviceOperation = options.services[topic[0]].operations[topic[1]];
    
                    const serviceProviderPath = path.resolve(__dirname, "../../../../../src/app/services", serviceProviderName);
                    const serviceProvider = require(serviceProviderPath);
                    serviceProvider[serviceOperation.hanlder]( payload, {
                        topic: topic[0]+"."+topic[1],
                        key: key
                    });
                } 
                catch (error) 
                {
                    console.log( "Failed to handle event for ", topic, error );
                }
            },
        });
    }
}

module.exports = ConfigStream;