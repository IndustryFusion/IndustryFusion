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

package io.fusion.fusiongatewayapp.metricsservice;

import io.fusion.fusiongatewayapp.config.FusionGatewayAppConfig;
import io.fusion.fusiongatewayapp.dto.MetricsDataDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class RestMetricsPullService implements MetricsPullService {
    private final FusionGatewayAppConfig config;

    @Autowired
    public RestMetricsPullService(FusionGatewayAppConfig config) {
        this.config = config;
    }

    @Override
    public Map<String, String> getMetrics(final String jobId) {
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<MetricsDataDto> response = restTemplate.getForEntity(getRestServiceUrl(jobId),
                MetricsDataDto.class);

        if (response.getStatusCode().value() == 200 && response.getBody() != null
                && response.getBody().getData() != null) {
            return response.getBody().getData();
        } else {
            throw new RestClientException(response.getStatusCode().toString());
        }
    }

    private String getRestServiceUrl(final String jobId) {
        return ensureTrailingSlash(config.getDataServiceBaseUrl()) + jobId;
    }

    private static String ensureTrailingSlash(final String url) {
        if (!url.substring(url.length() - 1).equals("/")) {
            return url + "/";
        }
        return url;
    }

    @Override
    public String getName() {
        return getClass().getSimpleName();
    }
}
