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

package io.fusion.fusiongatewayapp.mapper;

import io.fusion.fusiongatewayapp.config.FusionGatewayAppConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.stream.Collectors;

@Component
public class MetricsMapper {
    private final FusionGatewayAppConfig appConfig;

    @Autowired
    public MetricsMapper(FusionGatewayAppConfig appConfig) {
        this.appConfig = appConfig;
    }

    public Map<String, String> mapSourceToTargetMetrics(final String jobId, final Map<String, String> sourceMetrics) {
        FusionGatewayAppConfig.JobSpec jobSpec = appConfig.getJobSpecs().get(jobId);

        return jobSpec.getFields().stream()
                .filter(fieldSpec -> sourceMetrics.containsKey(fieldSpec.getSource()))
                .collect(Collectors.toMap(FusionGatewayAppConfig.FieldSpec::getTarget,
                        fieldSpec -> sourceMetrics.get(fieldSpec.getSource())));
    }

    public Map<String, String> getComponents(final String jobId) {
        final FusionGatewayAppConfig.JobSpec jobSpec = appConfig.getJobSpecs().get(jobId);

        return jobSpec.getFields().stream()
                .collect(Collectors.toMap(FusionGatewayAppConfig.FieldSpec::getTarget,
                        FusionGatewayAppConfig.FieldSpec::getComponentType));
    }
}
