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

package io.fusion.fusiongatewayapp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@ConfigurationProperties("fusiongateway")
public class FusionGatewayAppConfig {
    public enum Type {
        PULL,
        PUSH
    }

    private String name;
    private String dataServiceBaseUrl;
    private Type type;
    private Boolean autorun;
    private String sourceImplementation;
    private String targetImplementation;
    private Integer oispPort;
    private String oispHost;
    private Map<String, JobSpec> jobSpecs;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDataServiceBaseUrl() {
        return dataServiceBaseUrl;
    }

    public void setDataServiceBaseUrl(String dataServiceBaseUrl) {
        this.dataServiceBaseUrl = dataServiceBaseUrl;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public Boolean getAutorun() {
        return autorun;
    }

    public void setAutorun(Boolean autorun) {
        this.autorun = autorun;
    }

    public String getSourceImplementation() {
        return sourceImplementation;
    }

    public void setSourceImplementation(String sourceImplementation) {
        this.sourceImplementation = sourceImplementation;
    }

    public String getTargetImplementation() {
        return targetImplementation;
    }

    public void setTargetImplementation(String targetImplementation) {
        this.targetImplementation = targetImplementation;
    }

    public Integer getOispPort() {
        return oispPort;
    }

    public void setOispPort(Integer oispPort) {
        this.oispPort = oispPort;
    }

    public String getOispHost() {
        return oispHost;
    }

    public void setOispHost(String oispHost) {
        this.oispHost = oispHost;
    }

    public Map<String, JobSpec> getJobSpecs() {
        return jobSpecs;
    }

    public void setJobSpecs(Map<String, JobSpec> jobSpecs) {
        this.jobSpecs = jobSpecs;
    }

    public static class JobSpec {
        private Integer period;
        private List<FieldSpec> fields;

        public Integer getPeriod() {
            return period;
        }

        public void setPeriod(Integer period) {
            this.period = period;
        }

        public List<FieldSpec> getFields() {
            return fields;
        }

        public void setFields(List<FieldSpec> fields) {
            this.fields = fields;
        }
    }

    public static class FieldSpec {
        private String source;
        private String target;
        private String componentType;

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }

        public String getTarget() {
            return target;
        }

        public void setTarget(String target) {
            this.target = target;
        }

        public String getComponentType() {
            return componentType;
        }

        public void setComponentType(String componentType) {
            this.componentType = componentType;
        }
    }
}
