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

public class VideoStorageClient {
    private static final Long MAX_FILE_SIZE_MB = 1024L;
    private static final String MEDIA_TYPE_PREFIX = "video/";

    private final ObjectStorageBaseClient client;

    public VideoStorageClient(@NotNull ObjectStorageBaseClient client) {
        this.client = client;
        client.setMaxFileSize(MAX_FILE_SIZE_MB);
    }

    public MediaObjectDto getVideo(@NotNull final String uniqueVideoKey) throws ResourceNotFoundException {
        if (isContentTypeInvalid(getContentType(uniqueVideoKey))) {
            throw new IllegalArgumentException("Content type is invalid");
        }

        byte[] videoContent = client.getFile(uniqueVideoKey);

        try {
            String videoContentBase64 = Base64.getEncoder().withoutPadding().encodeToString(videoContent);

            String contentType = getContentType(uniqueVideoKey);
            return MediaObjectDto.builder()
                    .companyId(client.getConfig().companyId)
                    .fileKey(uniqueVideoKey)
                    .filename(BaseClient.getFileNameFromUniqueFileKey(uniqueVideoKey))
                    .contentBase64(videoContentBase64)
                    .fileSize(BaseClient.getFileSizeFrom64Based(videoContentBase64))
                    .contentType(contentType)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResourceNotFoundException();
        }
    }

    private boolean isContentTypeInvalid(@NotNull final String contentTypeLowerCase) {
        return !contentTypeLowerCase.startsWith(MEDIA_TYPE_PREFIX);
    }

    private String getContentType(final String fileKey) {
        String fileExtension = BaseClient.getFileExtension(fileKey).toLowerCase(Locale.ROOT);
        return MEDIA_TYPE_PREFIX + fileExtension;
    }

    public MediaObjectDto uploadVideo(@NotNull MediaObjectDto manualDto) throws ExternalApiException  {

        final String contentType = manualDto.getContentType().toLowerCase(Locale.ROOT);
        if (isContentTypeInvalid(contentType)) {
            throw new IllegalArgumentException("Content type is invalid");
        }

        manualDto.setContentType(contentType);
        return client.uploadFile(manualDto);
    }

    public void deleteVideoErrorIfNotExist(@NotNull final String videoKey) {
        client.deleteFileErrorIfNotExist(videoKey);
    }
}
