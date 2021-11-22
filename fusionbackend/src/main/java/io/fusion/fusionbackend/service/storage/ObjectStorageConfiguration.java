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

public class ObjectStorageConfiguration {

    public final String endpointUrl;
    public final String bucketName;
    public final String path;
    public final Long companyId;
    public final String accessKey;
    public final String secretKey;
    public Long maxFileSizeMb;

    public ObjectStorageConfiguration(final String endpointUrl,
                                      final String bucketName,
                                      final String path,
                                      final Long companyId,
                                      final String accessKey,
                                      final String secretKey) {
        this.endpointUrl = endpointUrl;
        this.bucketName = bucketName;
        this.path = path;
        this.companyId = companyId;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.maxFileSizeMb = 3L;
    }

    public boolean isValid() {
        return isNotEmpty(endpointUrl) && isNotEmpty(bucketName)
                && path != null && companyId >= 0
                && isNotEmpty(accessKey) && isNotEmpty(secretKey);
    }

    private boolean isNotEmpty(String text) {
        return text != null && text.trim().length() > 0;
    }
}
