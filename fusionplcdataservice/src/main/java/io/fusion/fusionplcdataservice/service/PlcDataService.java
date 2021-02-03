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

package io.fusion.fusionplcdataservice.service;

import io.fusion.fusionplcdataservice.config.FusionPlcDataServiceConfig;
import io.fusion.fusionplcdataservice.dto.PlcDataDto;
import io.fusion.fusionplcdataservice.exception.JobNotFoundException;
import io.fusion.fusionplcdataservice.exception.ReadException;
import org.apache.plc4x.java.PlcDriverManager;
import org.apache.plc4x.java.api.PlcConnection;
import org.apache.plc4x.java.api.messages.PlcReadRequest;
import org.apache.plc4x.java.api.messages.PlcReadResponse;
import org.apache.plc4x.java.api.types.PlcResponseCode;
import org.apache.plc4x.java.utils.connectionpool.PooledPlcDriverManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class PlcDataService {

    private final PlcDriverManager plcDriverManager;
    private final FusionPlcDataServiceConfig fusionPlcDataServiceConfig;

    @Autowired
    public PlcDataService(FusionPlcDataServiceConfig fusionPlcDataServiceConfig) {
        this.fusionPlcDataServiceConfig = fusionPlcDataServiceConfig;
        // We're using the pooled version of the PlcDriverManager (This keeps the connection open)
        this.plcDriverManager = new PooledPlcDriverManager();
    }

    public PlcDataDto getPlcData(final String jobId) {
        try (PlcConnection plcConnection = plcDriverManager.getConnection(
                fusionPlcDataServiceConfig.getConnectionString())) {
            // First check we have a configuration for the given job id.
            final List<FusionPlcDataServiceConfig.FieldSpec> fieldSpecs =
                    fusionPlcDataServiceConfig.getJobSpecs().get(jobId);
            if (fieldSpecs == null) {
                throw new JobNotFoundException();
            }

            // Prepare a read-request for this job.
            final PlcReadRequest.Builder readRequestBuilder = plcConnection.readRequestBuilder();
            for (FusionPlcDataServiceConfig.FieldSpec fieldSpec : fieldSpecs) {
                readRequestBuilder.addItem(fieldSpec.getTarget(), fieldSpec.getSource());
            }
            final PlcReadRequest readRequest = readRequestBuilder.build();

            try {
                // Execute the read-request.
                final PlcReadResponse readResponse = readRequest.execute().get();

                // Convert the result into a data structure Industry Fusion can understand.
                Map<String, String> data = new HashMap<>();
                for (String fieldName : readResponse.getFieldNames()) {
                    if (readResponse.getResponseCode(fieldName) == PlcResponseCode.OK) {
                        data.put(fieldName, readResponse.getObject(fieldName).toString());
                    }
                }
                return new PlcDataDto.Builder()
                        .jobId(jobId)
                        .plcName(fusionPlcDataServiceConfig.getName())
                        .timestamp(OffsetDateTime.now(ZoneOffset.UTC))
                        .data(data)
                        .build();
            } catch (ExecutionException e) {
                throw new ReadException();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new ReadException();
            }
        } catch (Exception e) {
            throw new ReadException();
        }
    }

}
