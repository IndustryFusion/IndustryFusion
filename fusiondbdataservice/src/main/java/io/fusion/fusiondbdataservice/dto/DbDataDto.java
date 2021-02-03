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

package io.fusion.fusiondbdataservice.dto;

import java.time.OffsetDateTime;
import java.util.Map;

public class DbDataDto {
    private String jobId;
    // Other data passed through from config
    private String machineName;
    private OffsetDateTime timestamp;

    private Map<String, String> data;

    private DbDataDto(Builder builder) {
        setJobId(builder.jobId);
        setMachineName(builder.machineName);
        setTimestamp(builder.timestamp);
        setData(builder.data);
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getMachineName() {
        return machineName;
    }

    public void setMachineName(String machineName) {
        this.machineName = machineName;
    }

    public Map<String, String> getData() {
        return data;
    }

    public void setData(Map<String, String> data) {
        this.data = data;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public static final class Builder {
        private String jobId;
        private String machineName;
        private OffsetDateTime timestamp;
        private Map<String, String> data;

        public Builder() {
        }

        public Builder jobId(String val) {
            jobId = val;
            return this;
        }

        public Builder machineName(String val) {
            machineName = val;
            return this;
        }

        public Builder timestamp(OffsetDateTime val) {
            timestamp = val;
            return this;
        }

        public Builder data(Map<String, String> val) {
            data = val;
            return this;
        }

        public DbDataDto build() {
            return new DbDataDto(this);
        }
    }
}
