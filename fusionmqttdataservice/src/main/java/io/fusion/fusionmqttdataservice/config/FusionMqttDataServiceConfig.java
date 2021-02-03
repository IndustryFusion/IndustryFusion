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

package io.fusion.fusionmqttdataservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@ConfigurationProperties("fusionmqttdataservice")
public class FusionMqttDataServiceConfig {
    private String name;
    private Boolean autorun;
    private String mqttBrokerUrl;
    private String gatewayAppBaseUrl;
    private String jobId;

    private Map<String, TopicSpec> topicSpecs;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getAutorun() {
        return autorun;
    }

    public void setAutorun(Boolean autorun) {
        this.autorun = autorun;
    }

    public String getMqttBrokerUrl() {
        return mqttBrokerUrl;
    }

    public void setMqttBrokerUrl(String mqttBrokerUrl) {
        this.mqttBrokerUrl = mqttBrokerUrl;
    }

    public String getGatewayAppBaseUrl() {
        return gatewayAppBaseUrl;
    }

    public void setGatewayAppBaseUrl(String gatewayAppBaseUrl) {
        this.gatewayAppBaseUrl = gatewayAppBaseUrl;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public Map<String, TopicSpec> getTopicSpecs() {
        return topicSpecs;
    }

    public void setTopicSpecs(Map<String, TopicSpec> topicSpecs) {
        this.topicSpecs = topicSpecs;
    }

    public static class TopicSpec {
        private List<FieldSpec> fields;
        private String payloadType;

        public List<FieldSpec> getFields() {
            return fields;
        }

        public void setFields(List<FieldSpec> fields) {
            this.fields = fields;
        }

        public String getPayloadType() {
            return payloadType;
        }

        public void setPayloadType(String payloadType) {
            this.payloadType = payloadType;
        }
    }

    public static class FieldSpec {
        private String source;
        private String target;

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }

        public String getTarget() {
            return target;
        }

        public void setTarget(String target) {
            this.target = target;
        }
    }
}
