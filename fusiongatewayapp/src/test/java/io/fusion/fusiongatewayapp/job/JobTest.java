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

import io.fusion.fusiongatewayapp.outputservice.OispOutputService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.util.ArrayList;
import java.util.List;

public class JobTest {
    private static final Logger LOG = LoggerFactory.getLogger(JobTest.class);

    public class UdpPacketReceiver implements Runnable {

        private boolean cancelled = false;
        private List<String> messages = new ArrayList<>();
        private DatagramSocket socket;

        public UdpPacketReceiver(DatagramSocket socket) {
            this.socket = socket;
        }

        @Override
        public void run() {
            while (!cancelled) {
                try {
                    messages.add(receiveUdpPacket());
                } catch (IOException e) {
                    // Ignore and proceed
                }
            }
        }

        public void cancel() {
            cancelled = true;
        }

        public List<String> getMessages() {
            return messages;
        }

        public void reset() {
            messages.clear();
        }

        public String receiveUdpPacket() throws IOException {
            byte[] receive = new byte[65535];

            DatagramPacket packet = new DatagramPacket(receive, receive.length);
            socket.receive(packet);
            final String payload = new String(packet.getData()).trim();
            LOG.info("UDP Packet received: " + payload);
            return payload;
        }
    }


    public String normaliseNewlines(final String payload) {
        return payload.replace("\n", "").replace("\r", "");
    }
}
