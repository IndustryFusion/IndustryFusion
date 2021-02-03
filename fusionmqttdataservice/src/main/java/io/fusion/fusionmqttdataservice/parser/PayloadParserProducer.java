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

package io.fusion.fusionmqttdataservice.parser;

import io.fusion.fusionmqttdataservice.exception.ParserNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class PayloadParserProducer {
    private static final Logger LOG = LoggerFactory.getLogger(PayloadParserProducer.class);

    private final Map<String, PayloadParser> registeredPayloadParsers;

    @Autowired
    public PayloadParserProducer(final List<PayloadParser> payloadParsers) {
        this.registeredPayloadParsers = payloadParsers.stream().collect(Collectors.toMap(PayloadParser::getName,
                payloadParser -> payloadParser));
    }

    public PayloadParser getPayloadParser(final String payloadParserType) {
        if (!registeredPayloadParsers.containsKey(payloadParserType)) {
            LOG.warn("Parser not found: {}", payloadParserType);
            throw new ParserNotFoundException();
        }
        return registeredPayloadParsers.get(payloadParserType);
    }
}
