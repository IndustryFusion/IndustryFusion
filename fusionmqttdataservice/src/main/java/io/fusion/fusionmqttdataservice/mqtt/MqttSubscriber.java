/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package io.fusion.fusionmqttdataservice.mqtt;

import io.fusion.fusionmqttdataservice.config.FusionMqttDataServiceConfig;
import io.fusion.fusionmqttdataservice.exception.MqttClientException;
import io.fusion.fusionmqttdataservice.outputservice.GatewayOutputService;
import io.fusion.fusionmqttdataservice.parser.PayloadParser;
import io.fusion.fusionmqttdataservice.parser.PayloadParserProducer;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

@Component
public class MqttSubscriber implements MqttCallbackExtended {
    private static final Logger LOG = LoggerFactory.getLogger(MqttSubscriber.class);

    private final String clientId = MqttSubscriber.class.getName() + ":" + UUID.randomUUID();
    private final FusionMqttDataServiceConfig appConfig;
    private final GatewayOutputService gatewayOutputService;
    private final PayloadParserProducer payloadParserProducer;
    private MqttClient mqttClient;
    private String[] topics;

    @Autowired
    public MqttSubscriber(FusionMqttDataServiceConfig appConfig,
                          GatewayOutputService gatewayOutputService,
                          PayloadParserProducer payloadParserProducer) {
        this.appConfig = appConfig;
        this.payloadParserProducer = payloadParserProducer;
        this.gatewayOutputService = gatewayOutputService;
        topics = appConfig.getTopicSpecs().keySet().toArray(String[]::new);
    }

    public void start() {
        final String brokerUrl = appConfig.getMqttBrokerUrl();

        MqttConnectOptions connOpts = new MqttConnectOptions();
        connOpts.setCleanSession(true);
        connOpts.setAutomaticReconnect(true);
        try {
            mqttClient = new MqttClient(brokerUrl, clientId, new MemoryPersistence());
        } catch (MqttException e) {
            throw new MqttClientException("Create", e);
        }
        LOG.info("Connecting to broker: {}", brokerUrl);
        try {
            mqttClient.connect(connOpts);
            mqttClient.setCallback(this);
        } catch (MqttException e) {
            throw new MqttClientException("Connect", e);
        }
        LOG.info("Subscribing to: {}", Arrays.toString(topics));
        try {
            mqttClient.subscribe(this.topics);
        } catch (MqttException e) {
            throw new MqttClientException("Subscribe", e);
        }
    }

    public void stop() {
        try {
            if (mqttClient != null && mqttClient.isConnected()) {
                mqttClient.disconnect();
            }
        } catch (MqttException e) {
            LOG.error("MqttClient topic unsubscribe error: ", e);
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        LOG.warn("MqttClient connectionLost (reconnecting): ", cause);
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) {
        try {
            processMessage(topic, message);
        } catch (Exception e) {
            LOG.warn("messageArrived: uncaught exception: " + message, e);
        }
    }

    private void processMessage(final String topic, final MqttMessage message) {
        FusionMqttDataServiceConfig.TopicSpec topicSpec = appConfig.getTopicSpecs().get(topic);

        if (message == null) {
            LOG.warn("messageArrived: message null");
            return;
        }

        PayloadParser payloadParser = payloadParserProducer.getPayloadParser(topicSpec.getPayloadType());
        Map<String, String> metrics = payloadParser.parsePayload(message.getPayload(), topicSpec.getFields());

        try {
            gatewayOutputService.sendMetrics(metrics);
        } catch (Exception e) {
            LOG.error("messageArrived: metric filtering failed " + new String(message.getPayload()), e);
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        LOG.error("deliveryComplete called although no messages should be sent!!! ");
    }

    @Override
    public void connectComplete(boolean reconnect, String serverUri) {
        System.out.println("Re-Connection Attempt " + reconnect);
        if (reconnect) {
            try {
                this.mqttClient.subscribe(this.topics);
            } catch (MqttException e) {
                throw new MqttClientException("Subscribe", e);
            }
        }
    }
}
