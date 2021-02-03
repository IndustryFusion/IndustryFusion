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
import io.fusion.fusiongatewayapp.job.PullMetricsAndOutputJob;
import io.fusion.fusiongatewayapp.mapper.MetricsMapper;
import io.fusion.fusiongatewayapp.metricsservice.MetricsPullService;
import io.fusion.fusiongatewayapp.outputservice.OutputService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

@Component
public class JobManager {
    private final TaskScheduler scheduler;
    private final FusionGatewayAppConfig config;
    private final ServiceProducer serviceProducer;
    private final MetricsMapper metricsMapper;
    private List<Future<?>> jobs;

    @Autowired
    public JobManager(TaskScheduler scheduler,
                      FusionGatewayAppConfig config,
                      ServiceProducer serviceProducer,
                      MetricsMapper metricsMapper) {
        this.scheduler = scheduler;
        this.config = config;
        this.serviceProducer = serviceProducer;
        this.metricsMapper = metricsMapper;
    }

    @EventListener
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (config.getAutorun() == null || config.getAutorun()) {
            start();
        }
    }

    public void start() {
        final OutputService outputService = serviceProducer.produceOutputService();
        if (config.getType().equals(FusionGatewayAppConfig.Type.PULL)) {
            MetricsPullService metricsPullService = serviceProducer.produceMetricsPullService();
            jobs = config.getJobSpecs().entrySet().stream()
                    .map(mapEntry -> scheduler.scheduleAtFixedRate(
                            new PullMetricsAndOutputJob(mapEntry.getKey(),
                                    metricsPullService,
                                    outputService,
                                    metricsMapper),
                            mapEntry.getValue().getPeriod()))
                    .collect(Collectors.toList());
        }
    }

    public void cancel() {
        if (jobs != null) {
            jobs.forEach(future -> future.cancel(true));
        }
    }
}
