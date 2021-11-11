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

package io.fusion.fusionbackend.rest.images;

import io.fusion.fusionbackend.dto.images.ImageDto;
import io.fusion.fusionbackend.rest.annotations.IsAnyFusionUser;
import io.fusion.fusionbackend.service.images.MinIoPhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@SuppressWarnings("checkstyle:AbbreviationAsWordInName")
@RestController
@IsAnyFusionUser
public class MinIoPhotoRestService {

    @Autowired
    public MinIoPhotoRestService() {
    }

    @GetMapping(path = "/companies/{companyId}/images/{imageId}")
    public ImageDto getImage(@PathVariable final Long companyId,
                             @PathVariable final Long imageId,
                             @RequestParam final String imageKey,
                             @RequestParam final String accessKey,
                             @RequestParam final String secretKey) {
        MinIoPhotoService minIoPhotoService = new MinIoPhotoService(companyId, accessKey, secretKey);
        return minIoPhotoService.getImage(imageKey);
    }

    @PostMapping(path = "/companies/{companyId}/images")
    public void uploadImage(@PathVariable final Long companyId,
                             @RequestBody final ImageDto imageDto,
                             @RequestParam final String accessKey,
                             @RequestParam final String secretKey) {
        MinIoPhotoService minIoPhotoService = new MinIoPhotoService(companyId, accessKey, secretKey);
        minIoPhotoService.uploadImage(imageDto.getFilename(), imageDto.getContentType(),
                imageDto.getImageContentBase64());
    }
}