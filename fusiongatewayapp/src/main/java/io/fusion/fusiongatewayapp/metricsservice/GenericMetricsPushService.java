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

import io.fusion.fusiongatewayapp.mapper.MetricsMapper;
import io.fusion.fusiongatewayapp.outputservice.OutputService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class GenericMetricsPushService implements MetricsPushService {
    private final OutputService outputService;
    private final MetricsMapper metricsMapper;

    @Autowired
    public GenericMetricsPushService(OutputService outputService,
                                     MetricsMapper metricsMapper) {
        this.outputService = outputService;
        this.metricsMapper = metricsMapper;
    }

    @Override
    public void receiveMetrics(String jobId, Map<String, String> sourceMetrics) {
        Map<String, String> targetMetrics = metricsMapper.mapSourceToTargetMetrics(jobId, sourceMetrics);

        Map<String, String> components = metricsMapper.getComponents(jobId);

        outputService.sendMetrics(targetMetrics, components);
    }

    @Override
    public String getName() {
        return getClass().getSimpleName();
    }
}
