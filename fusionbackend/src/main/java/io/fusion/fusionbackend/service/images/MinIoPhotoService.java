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
import io.fusion.fusionbackend.exception.InvalidException;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.UploadObjectArgs;
import io.minio.errors.MinioException;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Locale;

public class MinIoPhotoService {

    private static final String ENDPOINT_URL = "http://localhost:9000/";

    private final MinioClient minioClient;
    private final String bucketName;
    private final Long companyId;

    public MinIoPhotoService(final Long companyId, final String accessKey, final String secretKey) {
        this.companyId = companyId;
        this.minioClient = createClient(accessKey, secretKey);
        this.bucketName = "company" + companyId.toString();

        assert existBucket(this.bucketName);
    }

    private String getImagePath(final String imageKey) {
        return "photos" + "/" + imageKey;
    }

    private MinioClient createClient(final String accessKey, final String secretKey) {
        // 1. Create client to S3 service 'play.min.io' at port 443 with TLS security
        // for anonymous access.
        return MinioClient.builder()
                        .endpoint(ENDPOINT_URL)
                        .credentials(accessKey, secretKey)
                        .build();
    }

    public boolean existBucket(final String bucketName) {
        try {
            return minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        } catch (Exception e) {
            return false;
        }
    }

    public ImageDto getImage(final String imageKey) throws ResourceNotFoundException {

        try {
            String imageContentBase64;
            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

                minioClient.getObject(
                                GetObjectArgs.builder()
                                        .bucket(bucketName)
                                        .object(getImagePath(imageKey))
                                        .build())
                        .transferTo(outputStream);

                imageContentBase64 = Base64.getEncoder().withoutPadding().encodeToString(outputStream.toByteArray());
            }

            return ImageDto.builder()
                    .companyId(companyId)
                    .filename(imageKey)
                    .imageContentBase64(imageContentBase64)
                    .contentType("image/" + getFileExtension(imageKey))
                    .build();
        } catch (Exception e) {
            throw new ResourceNotFoundException();
        }
    }

    private String getFileExtension(final String filename) {
        String[] parts = filename.split("\\.");
        return parts.length > 1 ? parts[parts.length - 1] : "jpeg";
    }

    public void uploadImage(final String imageKey, String contentType,
                            final String imageContent64Based) throws ExternalApiException  {

        assert imageKey != null;
        assert contentType != null;
        assert imageContent64Based != null;
        contentType = contentType.toLowerCase(Locale.ROOT);
        if (!isContentTypeValid(contentType)) {
            throw new InvalidException();
        }

        String imageContentWithoutContentType = imageContent64Based.replace("data:" + contentType + ";base64,", "");
        byte[] imageContent = Base64.getDecoder().decode(imageContentWithoutContentType);

        File filename = createTempFile(imageContent, contentType.replace("image/", ""));
        assert filename != null;

        try {
            minioClient.uploadObject(
                    UploadObjectArgs.builder()
                            .bucket(bucketName)
                            .object(getImagePath(imageKey))
                            .filename(filename.getAbsolutePath())
                            .contentType(contentType)
                            .build());
        } catch (MinioException e) {
            System.out.println("Error occurred: " + e);
            System.out.println("HTTP trace: " + e.httpTrace());
            throw new ExternalApiException();
        }  catch (Exception e) {
            e.printStackTrace();
            throw new ExternalApiException();
        }
    }

    private boolean isContentTypeValid(final String contentType) {
        return contentType.equals("image/png") || contentType.equals("image/jpeg");
    }

    private File createTempFile(final byte[] imageContent, final String fileExtension) {
        try {
            String tempDir = System.getProperty("java.io.tmpdir");

            File dir = new File(tempDir);
            File file = File.createTempFile(".if-", "." + fileExtension, dir);

            FileOutputStream fileOutputStream = new FileOutputStream(file.getAbsolutePath());
            fileOutputStream.write(imageContent);
            fileOutputStream.close();

            return file;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
