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

public class ManualStorageClient {
    private static final Long MAX_FILE_SIZE_MB = 20L;
    private static final String MEDIA_TYPE_PREFIX = "application/";

    private final ObjectStorageBaseClient client;

    public ManualStorageClient(@NotNull ObjectStorageBaseClient client) {
        this.client = client;
        client.setMaxFileSize(MAX_FILE_SIZE_MB);
    }

    public MediaObjectDto getManual(@NotNull final String uniqueManualKey) throws ResourceNotFoundException {
        if (isContentTypeInvalid(getContentType(uniqueManualKey))) {
            throw new IllegalArgumentException("Content type is invalid");
        }

        byte[] manualContent = client.getFile(uniqueManualKey);

        try {
            String manualContentBase64 = Base64.getEncoder().withoutPadding().encodeToString(manualContent);

            String contentType = getContentType(uniqueManualKey);
            return MediaObjectDto.builder()
                    .companyId(client.getConfig().companyId)
                    .fileKey(uniqueManualKey)
                    .filename(BaseClient.getFileNameFromUniqueFileKey(uniqueManualKey))
                    .contentBase64(manualContentBase64)
                    .fileSize(BaseClient.getFileSizeFrom64Based(manualContentBase64))
                    .contentType(contentType)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResourceNotFoundException();
        }
    }

    private boolean isContentTypeInvalid(@NotNull final String contentTypeLowerCase) {
        return !contentTypeLowerCase.equals(MEDIA_TYPE_PREFIX + "pdf");
    }

    private String getContentType(final String fileKey) {
        String fileExtension = BaseClient.getFileExtension(fileKey).toLowerCase(Locale.ROOT);
        return MEDIA_TYPE_PREFIX + fileExtension;
    }

    public MediaObjectDto uploadManual(@NotNull MediaObjectDto manualDto) throws ExternalApiException  {

        final String contentType = manualDto.getContentType().toLowerCase(Locale.ROOT);
        if (isContentTypeInvalid(contentType)) {
            throw new IllegalArgumentException("Content type is invalid");
        }

        manualDto.setContentType(contentType);
        return client.uploadFile(manualDto);
    }

    public void deleteManualErrorIfNotExist(@NotNull final String manualKey) {
        client.deleteFileErrorIfNotExist(manualKey);
    }
}
