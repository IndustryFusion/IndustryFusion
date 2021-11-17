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
import io.fusion.fusionbackend.dto.images.ImageDto;
import io.fusion.fusionbackend.rest.annotations.IsObjectStorageUser;
import io.fusion.fusionbackend.service.images.AwsImageClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


@SuppressWarnings("checkstyle:AbbreviationAsWordInName")
@RestController
@IsObjectStorageUser
public class ObjectStorageRestService {

    @Autowired
    public ObjectStorageRestService() {
    }

    @GetMapping(path = "/companies/{companyId}/images/{imageKey}")
    public ImageDto getImage(@PathVariable final Long companyId,
                             @PathVariable final String imageKey) {
        AwsImageClient awsImageClient = new AwsImageClient(companyId,
                ObjectStorageAuth.getApiKey(), ObjectStorageAuth.getSecretKey());
        return awsImageClient.getImage(imageKey);
    }

    @PostMapping(path = "/companies/{companyId}/images")
    public ImageDto uploadImage(@PathVariable final Long companyId,
                            @RequestBody final ImageDto imageDto) {
        AwsImageClient awsImageClient = new AwsImageClient(companyId,
                ObjectStorageAuth.getApiKey(), ObjectStorageAuth.getSecretKey());
        return awsImageClient.uploadImage(imageDto);
    }
}