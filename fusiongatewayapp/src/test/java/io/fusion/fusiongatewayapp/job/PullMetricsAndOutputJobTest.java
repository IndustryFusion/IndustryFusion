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

package io.fusion.fusiongatewayapp.job;

import com.github.tomakehurst.wiremock.WireMockServer;
import io.fusion.fusiongatewayapp.config.FusionGatewayAppConfig;
import io.fusion.fusiongatewayapp.mapper.MetricsMapper;
import io.fusion.fusiongatewayapp.metricsservice.MetricsPullService;
import io.fusion.fusiongatewayapp.outputservice.OutputService;
import io.fusion.fusiongatewayapp.service.JobManager;
import io.fusion.fusiongatewayapp.service.ServiceProducer;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.net.DatagramSocket;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("pull")
public class PullMetricsAndOutputJobTest extends JobTest {
    @Autowired
    private FusionGatewayAppConfig appConfig;

    @Autowired
    private JobManager jobManager;

    @Autowired
    private ServiceProducer serviceProducer;

    @Autowired
    private MetricsMapper metricsMapper;

    @BeforeAll
    public static void setup() {
        WireMockServer wireMockServer = new WireMockServer(8081);
        wireMockServer.start();
    }

    @Test
    public void testRestPullSeldom() throws IOException {
        // Cancel the jobs in the embedded spring boot
        jobManager.cancel();

        DatagramSocket socket = new DatagramSocket(appConfig.getOispPort());
        UdpPacketReceiver udpPacketReceiver = new UdpPacketReceiver(socket);
        new Thread(udpPacketReceiver).start();

        PullMetricsAndOutputJob pullMetricsAndOutputJob = new PullMetricsAndOutputJob("seldomdata",
                serviceProducer.produceMetricsPullService(), serviceProducer.produceOutputService(), metricsMapper);
        udpPacketReceiver.reset();
        pullMetricsAndOutputJob.run();

        await().until(() -> udpPacketReceiver.getMessages().size() == 4);

        List<String> receivedMessages = udpPacketReceiver.getMessages().stream().map(this::normaliseNewlines).collect(Collectors.toList());

        List<String> expectedMessages = new ArrayList<>();
        expectedMessages.add("{\"n\":\"raumtemperatur\",\"t\":\"Temperature.v1.0\"}");
        expectedMessages.add("{\"n\":\"luftverbrauch\",\"t\":\"Luftverbrauch.v1.0\"}");
        expectedMessages.add("{\"n\":\"raumtemperatur\",\"v\":\"38\"}");
        expectedMessages.add("{\"n\":\"luftverbrauch\",\"v\":\"47\"}");
        assertThat(receivedMessages).containsExactlyInAnyOrderElementsOf(expectedMessages);

        udpPacketReceiver.cancel();
        socket.close();
    }
}
