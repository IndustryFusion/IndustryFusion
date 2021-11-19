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

package io.fusion.fusionbackend.service.images;

import io.fusion.fusionbackend.dto.images.ImageDto;
import io.fusion.fusionbackend.exception.ExternalApiException;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import org.jetbrains.annotations.NotNull;

import java.util.Base64;
import java.util.Locale;

public class AwsImageClient extends AwsClient {
    private static final Long MAX_FILE_SIZE_MB = 3L;

    public AwsImageClient(@NotNull final Long companyId,
                          @NotNull final String accessKey,
                          @NotNull final String secretKey) {
        super(companyId, accessKey, secretKey);
        this.basePath = "company" + companyId + "/photos/";
    }

    public ImageDto getImage(@NotNull final String imageKey) throws ResourceNotFoundException {
        byte[] imageContent = getFile(imageKey);

        try {
            String imageContentBase64 = Base64.getEncoder().withoutPadding().encodeToString(imageContent);

            String contentType = getContentType(imageKey);
            return ImageDto.builder()
                    .companyId(companyId)
                    .filename(imageKey)
                    .imageContentBase64("data:" + contentType + ";base64," + imageContentBase64)
                    .fileSize(getFileSizeFrom64Based(imageContentBase64))
                    .contentType(contentType)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResourceNotFoundException();
        }
    }

    @Override
    protected String getContentType(String key) {
        return "image/" + getFileExtension(key).toLowerCase(Locale.ROOT).replace("jpg", "jpeg");
    }

    public ImageDto uploadImage(@NotNull ImageDto imageDto) throws ExternalApiException  {

        final String contentType = imageDto.getContentType().toLowerCase(Locale.ROOT).replace("jpg", "jpeg");

        Long fileSize = uploadFile(imageDto.getImageContentBase64(), contentType, getFilePath(imageDto.getFilename()));

        imageDto.setFileSize(fileSize);
        imageDto.setContentType(contentType);

        return imageDto;
    }

    @Override
    protected boolean isContentTypeInvalid(@NotNull final String contentTypeLowerCase) {
        return !contentTypeLowerCase.equals("image/png") && !contentTypeLowerCase.equals("image/jpeg");
    }

    @Override
    public Long getMaxFileSizeMb() {
        return MAX_FILE_SIZE_MB;
    }
}
