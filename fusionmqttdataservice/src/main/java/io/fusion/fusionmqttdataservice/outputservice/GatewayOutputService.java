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

package io.fusion.fusionmqttdataservice.outputservice;

import io.fusion.fusionmqttdataservice.config.FusionMqttDataServiceConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class GatewayOutputService implements OutputService {
    private static final Logger LOG = LoggerFactory.getLogger(GatewayOutputService.class);
    private final FusionMqttDataServiceConfig config;

    @Autowired
    public GatewayOutputService(final FusionMqttDataServiceConfig config) {
        this.config = config;
    }

    @Override
    public void sendMetrics(Map<String, String> metrics) {
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.postForEntity(getRestServiceUrl(config.getJobId()),
                metrics, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            LOG.warn("Post metrics not successful: {} ({})", response.getStatusCode(), response.getBody());
        }
    }

    private String getRestServiceUrl(final String jobId) {
        return ensureTrailingSlash(config.getGatewayAppBaseUrl()) + jobId;
    }

    private static String ensureTrailingSlash(final String url) {
        if (!url.substring(url.length() - 1).equals("/")) {
            return url + "/";
        }
        return url;
    }
}
