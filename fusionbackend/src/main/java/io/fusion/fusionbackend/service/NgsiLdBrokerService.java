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

package io.fusion.fusionbackend.service;

import io.fusion.fusionbackend.model.Asset;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Service
public class NgsiLdBrokerService {
    private static final Logger LOG = LoggerFactory.getLogger(NgsiLdBrokerService.class);
    private final NgsiLdSerializer ngsiLdSerializer;

    @Value("${ngsi-broker.server-url}/ngsi-ld/v1/entities/")
    private String url;

    public NgsiLdBrokerService(NgsiLdSerializer ngsiLdSerializer) {
        this.ngsiLdSerializer = ngsiLdSerializer;
    }

    public boolean installAssetOnBroker(Asset asset) {
        String assetAsNgsiLd = ngsiLdSerializer.getAssetByIdAsNgsiLD(asset);
        RestTemplate restTemplate = new RestTemplate();

        MultiValueMap<String, String> headers = new LinkedMultiValueMap<>();
        headers.add("Content-Type", "application/ld+json");
        HttpEntity httpEntity = new HttpEntity(assetAsNgsiLd, headers);

        ResponseEntity<Object> objectResponseEntity = null;
        LOG.debug("Try to post asset {} to broker", asset.getId());
        try {
            objectResponseEntity = restTemplate.postForEntity(url, httpEntity, null);
        } catch (HttpClientErrorException e) {
            if (!e.getStatusCode().equals(HttpStatus.CONFLICT)) {
                e.printStackTrace();
            } else {
                LOG.warn("Asset {} already installed on Broker", asset.getId());
            }
        }

        return Optional.ofNullable(objectResponseEntity)
                .map(ResponseEntity::getStatusCode)
                .map(HttpStatus::is2xxSuccessful)
                .orElse(false);
    }
}
