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

package io.fusion.fusionbackend.service.storage;

import io.fusion.fusionbackend.model.enums.ObjectStorageType;

import java.util.Locale;

public class ObjectStorageClientFactory {
    public static ObjectStorageBaseClient create(final ObjectStorageType type,
                                                 final ObjectStorageConfiguration configuration) {
        if (type == ObjectStorageType.MINIO) {
            return new MinIoClient(configuration);
        }
        return new AwsClient(configuration);
    }

    public static ObjectStorageType getType(final String serverType) {
        if (serverType == null) {
            throw new RuntimeException("Invalid configuration of object storage");
        }

        ObjectStorageType objectStorageType = ObjectStorageType.S3;
        if (serverType.toLowerCase(Locale.ROOT).equals("minio")) {
            objectStorageType = ObjectStorageType.MINIO;
        }
        return objectStorageType;
    }
}
