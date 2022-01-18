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

import io.fusion.fusionbackend.dto.storage.MediaObjectDto;
import io.fusion.fusionbackend.exception.ExternalApiException;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import org.jetbrains.annotations.NotNull;

import java.util.Base64;
import java.util.Locale;

public class ImageStorageClient {
    private static final Long MAX_FILE_SIZE_MB = 3L;
    private static final String MEDIA_TYPE_PREFIX = "image/";

    private final ObjectStorageBaseClient client;

    public ImageStorageClient(@NotNull ObjectStorageBaseClient client) {
        this.client = client;
        client.setMaxFileSize(MAX_FILE_SIZE_MB);
    }

    public MediaObjectDto getImage(@NotNull final String uniqueImageKey) throws ResourceNotFoundException {
        if (isContentTypeInvalid(getContentType(uniqueImageKey))) {
            throw new IllegalArgumentException("Content type is invalid");
        }

        byte[] imageContent = client.getFile(uniqueImageKey);

        try {
            String imageContentBase64 = Base64.getEncoder().withoutPadding().encodeToString(imageContent);

            String contentType = getContentType(uniqueImageKey);
            return MediaObjectDto.builder()
                    .companyId(client.getConfig().companyId)
                    .fileKey(uniqueImageKey)
                    .filename(BaseClient.getFileNameFromUniqueFileKey(uniqueImageKey))
                    .contentBase64(imageContentBase64)
                    .fileSize(BaseClient.getFileSizeFrom64Based(imageContentBase64))
                    .contentType(contentType)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResourceNotFoundException();
        }
    }

    private boolean isContentTypeInvalid(@NotNull final String contentTypeLowerCase) {
        return !contentTypeLowerCase.equals(MEDIA_TYPE_PREFIX + "png")
                && !contentTypeLowerCase.equals(MEDIA_TYPE_PREFIX + "jpeg")
                && !contentTypeLowerCase.equals(MEDIA_TYPE_PREFIX + "svg+xml")
                && !contentTypeLowerCase.equals(MEDIA_TYPE_PREFIX + "bmp")
                && !contentTypeLowerCase.equals(MEDIA_TYPE_PREFIX + "tiff");
    }

    private String getContentType(final String fileKey) {
        String fileExtension = BaseClient.getFileExtension(fileKey).toLowerCase(Locale.ROOT);
        fileExtension = fileExtension.replace("jpg", "jpeg").replace("svg", "svg+xml");
        return MEDIA_TYPE_PREFIX + fileExtension;
    }

    public MediaObjectDto uploadImage(@NotNull MediaObjectDto imageDto) throws ExternalApiException  {

        final String contentType = imageDto.getContentType().toLowerCase(Locale.ROOT).replace("jpg", "jpeg");
        if (isContentTypeInvalid(contentType)) {
            throw new IllegalArgumentException("Content type is invalid");
        }

        imageDto.setContentType(contentType);
        return client.uploadFile(imageDto);
    }

    public void deleteImageErrorIfNotExist(@NotNull final String imageKey) {
        client.deleteFileErrorIfNotExist(imageKey);
    }
}
