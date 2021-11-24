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

package io.fusion.fusionbackend.rest.shared;

import io.fusion.fusionbackend.auth.ObjectStorageAuth;
import io.fusion.fusionbackend.dto.storage.MediaObjectDto;
import io.fusion.fusionbackend.model.enums.ObjectStorageType;
import io.fusion.fusionbackend.rest.annotations.IsObjectStorageUser;
import io.fusion.fusionbackend.service.storage.ImageStorageClient;
import io.fusion.fusionbackend.service.storage.ObjectStorageClientFactory;
import io.fusion.fusionbackend.service.storage.ObjectStorageConfiguration;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@IsObjectStorageUser
public class ObjectStorageRestService {

    private final Environment environment;

    @Autowired
    public ObjectStorageRestService(Environment environment) {
        this.environment = environment;
    }

    private ImageStorageClient createImageClient(final Long companyId) {
        final String serverType = environment.getProperty("object-storage.server-type");
        ObjectStorageType type = ObjectStorageClientFactory.getType(serverType);
        ObjectStorageConfiguration configuration = new ObjectStorageConfiguration(
                environment.getProperty("object-storage.server-url"),
                environment.getProperty("object-storage.buckets-prefix"),
                companyId,
                ObjectStorageAuth.getApiKey(),
                ObjectStorageAuth.getSecretKey()
        );

        return new ImageStorageClient(ObjectStorageClientFactory.create(type, configuration));
    }

    private String unescapeSlash(@NotNull String fileKey) {
        return fileKey.replace('$', '/');
    }

    @GetMapping(path = "/companies/{companyId}/images/{imageKey}")
    public MediaObjectDto getImage(@PathVariable final Long companyId,
                                   @PathVariable String imageKey) {
        imageKey = unescapeSlash(imageKey);
        return createImageClient(companyId).getImage(imageKey);
    }

    @PostMapping(path = "/companies/{companyId}/images")
    public MediaObjectDto uploadImage(@PathVariable final Long companyId,
                                      @RequestBody final MediaObjectDto imageDto) {
        return createImageClient(companyId).uploadImage(imageDto);
    }

    @DeleteMapping(path = "/companies/{companyId}/images/{imageKey}")
    public void deleteImage(@PathVariable final Long companyId,
                            @PathVariable String imageKey) {
        imageKey = unescapeSlash(imageKey);
        createImageClient(companyId).deleteImageErrorIfNotExist(imageKey);
    }
}