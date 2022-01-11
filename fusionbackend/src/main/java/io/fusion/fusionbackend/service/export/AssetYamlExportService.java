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

package io.fusion.fusionbackend.service.export;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.FieldInstance;
import io.fusion.fusionbackend.model.enums.FieldType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class AssetYamlExportService {

    public static final String YAML_CONTENT = "# Licensed under the Apache License, Version 2.0 (the \"License\");\n"
                                              + "# you may not use this file except in compliance with the License.\n"
                                              + "# You may obtain a copy of the License at\n"
                                              + "#\n"
                                              + "#   http://www.apache.org/licenses/LICENSE-2.0\n"
                                              + "#\n"
                                              + "# Unless required by applicable law or agreed to in writing,\n"
                                              + "# software distributed under the License is distributed on an\n"
                                              + "# \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY\n"
                                              + "# KIND, either express or implied.  See the License for the\n"
                                              + "# specific language governing permissions and limitations\n"
                                              + "# under the License.\n"
                                              + "\n";

    @Getter
    @Setter
    class FusionDataService {
        String name;
        String connectinString;
        String downstreamServiceBaseUrl = "http://localhost:8085/";
        DataServiceType dataServiceType;
        boolean autorun = true;
        JobSpecs jobSpecs;
    }

    @Getter
    @Setter
    private class JobSpecs {
        Betriebsdaten betriebsdaten;
    }

    @Getter
    @Setter
    private class Betriebsdaten {
        int period = 2000;
        Field[] fields;
    }

    @Getter
    @Setter
    private class Field {
        public Field(String source, String target) {
            this.source = source;
            this.target = target;
        }

        String source;
        String target;
    }


    public byte[] createYamlFile(Asset asset) throws IOException {
        FusionDataService fusiondataservice = new FusionDataService();
        fusiondataservice.name = asset.getName();
        fusiondataservice.connectinString = asset.getConnectionString();
        fusiondataservice.dataServiceType = getDataServiceType(asset.getAssetSeries());
        fusiondataservice.jobSpecs = new JobSpecs();
        fusiondataservice.jobSpecs.betriebsdaten = new Betriebsdaten();

        ArrayList<Field> fields = (ArrayList<Field>) asset.getFieldInstances().stream()
                .map(FieldInstance::getFieldSource)
                .filter(fieldSource -> fieldSource.getFieldTarget().getFieldType().equals(FieldType.METRIC))
                .map(fieldSource ->
                        new Field(fieldSource.getRegister(), fieldSource.getFieldTarget().getField().getLabel()))
                .collect(Collectors.toList());

        fusiondataservice.jobSpecs.betriebsdaten.fields = fields.toArray(new Field[fields.size()]);


        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        outputStream.write(YAML_CONTENT.getBytes(StandardCharsets.UTF_8));
        ObjectMapper objectMapper = new ObjectMapper(new YAMLFactory());
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(outputStream, fusiondataservice);
        return outputStream.toByteArray();
    }

    enum DataServiceType {
        PULL,
        PUSH
    }

    private DataServiceType getDataServiceType(AssetSeries assetSeries) {
        DataServiceType dataServiceType = DataServiceType.PULL;
        if (assetSeries.getConnectivitySettings().getConnectivityProtocol().getName().equals("MQTT")) {
            dataServiceType = DataServiceType.PUSH;
        }
        return dataServiceType;
    }
}
