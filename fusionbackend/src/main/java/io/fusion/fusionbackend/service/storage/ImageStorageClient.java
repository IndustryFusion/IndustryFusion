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

import io.fusion.fusionbackend.dto.images.ImageDto;
import io.fusion.fusionbackend.exception.ExternalApiException;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import org.jetbrains.annotations.NotNull;

import java.util.Base64;
import java.util.Locale;

public class ImageStorageClient {
    private static final Long MAX_FILE_SIZE_MB = 3L;

    private final ObjectStorageBaseClient client;

    public ImageStorageClient(@NotNull ObjectStorageBaseClient client) {
        this.client = client;
        client.setMaxFileSize(MAX_FILE_SIZE_MB);
    }

    public ImageDto getImage(@NotNull final String imageKey) throws ResourceNotFoundException {
        if (isContentTypeInvalid(getContentType(imageKey))) {
            throw new IllegalArgumentException("Content type is invalid");
        }

        byte[] imageContent = client.getFile(imageKey);

        try {
            String imageContentBase64 = Base64.getEncoder().withoutPadding().encodeToString(imageContent);

            String contentType = getContentType(imageKey);
            return ImageDto.builder()
                    .companyId(client.getConfig().companyId)
                    .filename(imageKey)
                    .imageContentBase64("data:" + contentType + ";base64," + imageContentBase64)
                    .fileSize(BaseClient.getFileSizeFrom64Based(imageContentBase64))
                    .contentType(contentType)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResourceNotFoundException();
        }
    }

    private boolean isContentTypeInvalid(@NotNull final String contentTypeLowerCase) {
        return !contentTypeLowerCase.equals("image/png") && !contentTypeLowerCase.equals("image/jpeg");
    }

    private String getContentType(String fileKey) {
        return "image/" + BaseClient.getFileExtension(fileKey).toLowerCase(Locale.ROOT).replace("jpg", "jpeg");
    }

    public ImageDto uploadImage(@NotNull ImageDto imageDto) throws ExternalApiException  {

        final String contentType = imageDto.getContentType().toLowerCase(Locale.ROOT).replace("jpg", "jpeg");
        if (isContentTypeInvalid(contentType)) {
            throw new IllegalArgumentException("Content type is invalid");
        }

        Long fileSize = client.uploadFile(imageDto.getImageContentBase64(), contentType,
                client.getFilePath(imageDto.getFilename()));

        imageDto.setFileSize(fileSize);
        imageDto.setContentType(contentType);

        return imageDto;
    }

    public void deleteImage(@NotNull final String imageKey) {
        client.deleteFile(imageKey);
    }
}
