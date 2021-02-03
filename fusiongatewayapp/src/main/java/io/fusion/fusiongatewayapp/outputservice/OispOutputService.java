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

package io.fusion.fusiongatewayapp.outputservice;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.fusion.fusiongatewayapp.config.FusionGatewayAppConfig;
import io.fusion.fusiongatewayapp.exception.UdpException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.net.SocketException;
import java.util.Map;

@Component
public class OispOutputService implements OutputService {
    private static final Logger LOG = LoggerFactory.getLogger(OispOutputService.class);
    private final FusionGatewayAppConfig config;

    private final Gson gson = new Gson();
    private DatagramSocket socket;
    private SocketAddress agentAddress;

    @Autowired
    public OispOutputService(final FusionGatewayAppConfig config) {
        this.config = config;
    }

    @PostConstruct
    public void init() {
        SocketAddress localAddress = new InetSocketAddress(0);
        try {
            socket = new DatagramSocket(localAddress);
        } catch (SocketException e) {
            throw new UdpException("Socket init", e);
        }
        agentAddress = new InetSocketAddress(config.getOispHost(), config.getOispPort());
    }

    @Override
    public void sendMetrics(Map<String, String> metrics, Map<String, String> components) {
        components.forEach((name, type) -> {
            String payload = generateCompponentRegistration(name, type);
            LOG.info("Sending componentRegistration <{}> to {}", payload, agentAddress);

            byte[] buf = payload.getBytes();
            DatagramPacket packet = new DatagramPacket(buf, buf.length, agentAddress);
            try {
                socket.send(packet);
            } catch (IOException e) {
                throw new UdpException("Socket send: componentRegistration", e);
            }
        });
        metrics.forEach((name, value) -> {
            String payload = generatePayload(name, value);
            LOG.info("Sending payload <{}> to {}", payload, agentAddress);

            byte[] buf = payload.getBytes();
            DatagramPacket packet = new DatagramPacket(buf, buf.length, agentAddress);
            try {
                socket.send(packet);
            } catch (IOException e) {
                throw new UdpException("Socket send: metric", e);
            }
        });
    }

    private String generateCompponentRegistration(String metricName, String metricType) {
        JsonObject componentRegistration = new JsonObject();
        componentRegistration.addProperty("n", metricName);
        componentRegistration.addProperty("t", metricType);
        return gson.toJson(componentRegistration) + "\n";
    }

    private String generatePayload(String metricName, String metricValue) {
        JsonObject metric = new JsonObject();
        metric.addProperty("n", metricName);
        if ("true".equals(metricValue) || "false".equals(metricValue)) {
            metric.addProperty("v", Boolean.parseBoolean(metricValue));
        } else {
            metric.addProperty("v", metricValue);
        }
        return gson.toJson(metric) + "\n";
    }

    @Override
    public String getName() {
        return getClass().getSimpleName();
    }
}
