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

package io.fusion.fusionmqttdataservice.service;

import io.fusion.fusionmqttdataservice.config.FusionMqttDataServiceConfig;
import io.fusion.fusionmqttdataservice.mqtt.MqttSubscriber;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class MqttMainService {
    private final MqttSubscriber mqttSubscriber;
    private final FusionMqttDataServiceConfig config;

    @Autowired
    public MqttMainService(MqttSubscriber mqttSubscriber, FusionMqttDataServiceConfig config) {
        this.mqttSubscriber = mqttSubscriber;
        this.config = config;
    }

    @EventListener
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (config.getAutorun() == null || config.getAutorun()) {
            mqttSubscriber.start();
        }
    }

    public void cancel() {
        mqttSubscriber.stop();
    }
}
