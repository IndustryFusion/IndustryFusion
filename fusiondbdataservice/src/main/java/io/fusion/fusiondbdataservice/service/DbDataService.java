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

package io.fusion.fusiondbdataservice.service;

import io.fusion.fusiondbdataservice.config.FusionDbDataServiceConfig;
import io.fusion.fusiondbdataservice.dto.DbDataDto;
import io.fusion.fusiondbdataservice.exception.JobNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DbDataService {
    private FusionDbDataServiceConfig fusionDbDataServiceConfig;
    private JdbcTemplate jdbcTemplate;

    @Autowired
    public DbDataService(FusionDbDataServiceConfig fusionDbDataServiceConfig, JdbcTemplate jdbcTemplate) {
        this.fusionDbDataServiceConfig = fusionDbDataServiceConfig;
        this.jdbcTemplate = jdbcTemplate;
    }

    public DbDataDto getDbData(final String jobId) {
        List<FusionDbDataServiceConfig.FieldSpec> jobFieldSpecs = fusionDbDataServiceConfig.getJobSpecs().get(jobId);
        if (jobFieldSpecs == null) {
            throw new JobNotFoundException();
        }

        Map<String, String> queriedData = jobFieldSpecs.stream().collect(Collectors.toMap(
                FusionDbDataServiceConfig.FieldSpec::getTarget,
                sourceSql -> {
                    String value;
                    try {
                        value = jdbcTemplate.queryForObject(sourceSql.getSource(), String.class);
                    } catch (EmptyResultDataAccessException e) {
                        value = "";
                    }
                    if (value == null) {
                        value = "";
                    }
                    return value;
                }));

        return new DbDataDto.Builder()
                .jobId(jobId)
                .machineName(fusionDbDataServiceConfig.getName())
                .timestamp(OffsetDateTime.now(ZoneOffset.UTC))
                .data(queriedData)
                .build();
    }
}
