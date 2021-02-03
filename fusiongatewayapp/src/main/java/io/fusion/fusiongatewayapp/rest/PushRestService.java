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

package io.fusion.fusiongatewayapp.rest;

import io.fusion.fusiongatewayapp.service.ServiceProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class PushRestService {
    private final ServiceProducer serviceProducer;

    @Autowired
    public PushRestService(ServiceProducer serviceProducer) {
        this.serviceProducer = serviceProducer;
    }

    @PostMapping(path = "/gateway/{jobId}")
    public void receivePushData(@PathVariable final String jobId,
                                @RequestBody final Map<String, String> metrics) {
        serviceProducer.produceMetricsPushService().receiveMetrics(jobId, metrics);
    }
}
