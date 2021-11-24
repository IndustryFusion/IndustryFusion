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
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.UploadObjectArgs;
import org.jetbrains.annotations.NotNull;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.Base64;

// see https://docs.min.io/docs/java-client-api-reference.html
public class MinIoClient extends BaseClient implements ObjectStorageBaseClient  {

    private final ObjectStorageConfiguration configuration;
    private final MinioClient minioClient;

    public MinIoClient(@NotNull final ObjectStorageConfiguration configuration) {
        assert configuration.isValid();

        this.minioClient = createClient(configuration.accessKey, configuration.secretKey, configuration.endpointUrl);
        this.configuration = configuration;

        assert existBucket(configuration.bucketName);
    }

    private MinioClient createClient(final String accessKey, final String secretKey, final String url) {
        return MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();
    }

    @Override
    public ObjectStorageConfiguration getConfig() {
        return configuration;
    }

    @Override
    public void setMaxFileSize(final Long maxFileSizeMb) {
        configuration.maxFileSizeMb = maxFileSizeMb;
    }

    @Override
    public boolean existBucket(final String bucketName) {
        try {
            return minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public byte[] getFile(@NotNull final String uniqueFileKey) throws ResourceNotFoundException {
        checkUniqueFileKey(uniqueFileKey);

        try {
            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                minioClient.getObject(GetObjectArgs.builder()
                                        .bucket(configuration.bucketName)
                                        .object(uniqueFileKey)
                                        .build())
                        .transferTo(outputStream);

                byte[] fileContent = outputStream.toByteArray();
                if (isFileSizeInvalid(fileContent, configuration)) {
                    String exceptionMessage = "File size is larger than " + configuration.maxFileSizeMb + " MB";
                    throw new IllegalArgumentException(exceptionMessage);
                }
                return fileContent;
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResourceNotFoundException();
        }
    }

    @Override
    public MediaObjectDto uploadFile(@NotNull final MediaObjectDto mediaObject) {

        if (isFileSizeInvalidBase64(mediaObject.getContentBase64(), configuration)) {
            throw new IllegalArgumentException("File size is larger than " + configuration.maxFileSizeMb + " MB");
        }

        String destinationPath = mediaObject.getFileKey();
        checkFileKey(destinationPath);
        destinationPath = createUniqueFileKey(destinationPath);

        String content64Based = getFileContent64BasedWithoutContentType(mediaObject.getContentBase64(),
                mediaObject.getContentType());
        byte[] fileContent = Base64.getDecoder().decode(content64Based);

        File tempFile = createTempFile(fileContent, getFileExtension(destinationPath));
        assert tempFile != null;

        try {
            // automatically creates subfolders if not existing
            minioClient.uploadObject(
                    UploadObjectArgs.builder()
                            .bucket(configuration.bucketName)
                            .object(destinationPath)
                            .filename(tempFile.getAbsolutePath())
                            .contentType(mediaObject.getContentType())
                            .build());

        } catch (Exception e) {
            e.printStackTrace();
            throw new ExternalApiException();
        } finally {
            deleteTempFile(tempFile);
        }

        mediaObject.setFileKey(destinationPath);
        mediaObject.setFilename(BaseClient.getFileNameFromUniqueFileKey(mediaObject.getFileKey()));
        mediaObject.setFileSize((long)fileContent.length);

        return mediaObject;
    }

    @Override
    public void deleteFileErrorIfNotExist(@NotNull String fileKey) {
        if (fileNotExisting(fileKey)) {
            throw new IllegalArgumentException("File to delete does not exist");
        }

        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(configuration.bucketName)
                    .object(fileKey)
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            throw new ExternalApiException();
        }
    }

    @Override
    public boolean fileNotExisting(@NotNull String fileKey) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(configuration.bucketName)
                            .object(fileKey)
                            .build());
            return false;
        } catch (Exception e) {
            return true;
        }
    }
}
