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

package io.fusion.fusiongatewayapp.service;

import io.fusion.fusiongatewayapp.config.FusionGatewayAppConfig;
import io.fusion.fusiongatewayapp.metricsservice.MetricsPullService;
import io.fusion.fusiongatewayapp.metricsservice.MetricsPushService;
import io.fusion.fusiongatewayapp.outputservice.OutputService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ServiceProducer {
    private final Map<String, OutputService> outputServices;
    private final Map<String, MetricsPullService> metricsPullServices;
    private final Map<String, MetricsPushService> metricsPushServices;
    private final FusionGatewayAppConfig config;

    @Autowired
    public ServiceProducer(List<OutputService> outputServices, List<MetricsPullService> metricsPullServices,
                           List<MetricsPushService> metricsPushServices, FusionGatewayAppConfig config) {
        this.config = config;
        this.outputServices = outputServices.stream()
                .collect(Collectors.toMap(OutputService::getName, service -> service));
        this.metricsPullServices = metricsPullServices.stream()
                .collect(Collectors.toMap(MetricsPullService::getName, service -> service));
        this.metricsPushServices = metricsPushServices.stream()
                .collect(Collectors.toMap(MetricsPushService::getName, service -> service));
    }

    public OutputService produceOutputService() {
        return outputServices.get(config.getTargetImplementation());
    }

    public MetricsPullService produceMetricsPullService() {
        return metricsPullServices.get(config.getSourceImplementation());
    }

    public MetricsPushService produceMetricsPushService() {
        return metricsPushServices.get(config.getSourceImplementation());
    }
}
