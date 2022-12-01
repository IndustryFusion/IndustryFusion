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

import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.PutObjectRequest;
import io.fusion.fusionbackend.dto.storage.MediaObjectDto;
import io.fusion.fusionbackend.exception.ExternalApiException;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import org.jetbrains.annotations.NotNull;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.Base64;

/**
 * Object Storage Implementation: AWS S3 Client.
 * @see
 * <a href="https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/examples-s3-objects.html#upload-object">docs.aws.amazon.com</a>
 */
public class AwsClient extends BaseClient implements ObjectStorageBaseClient {

    private final ObjectStorageConfiguration configuration;
    private final AmazonS3 s3Client;

    public AwsClient(@NotNull final ObjectStorageConfiguration configuration) {
        assert configuration.isValid();

        this.s3Client = createClient(configuration.accessKey, configuration.secretKey, configuration.endpointUrl);
        this.configuration = configuration;

        assert existBucket(configuration.bucketName);
    }

    private AmazonS3 createClient(final String accessKey, final String secretKey, final String url) {
        AWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
        return AmazonS3ClientBuilder
                .standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(url, "eu-west-1"))
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
            return s3Client.doesBucketExistV2(bucketName);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public byte[] getFile(@NotNull final String uniqueFileKey) throws ResourceNotFoundException {
        checkUniqueFileKey(uniqueFileKey);

        try {
            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                s3Client.getObject(new GetObjectRequest(configuration.bucketName, uniqueFileKey))
                        .getObjectContent()
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
            s3Client.putObject(new PutObjectRequest(configuration.bucketName, destinationPath, tempFile));

        } catch (AmazonServiceException e) {
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
    public void deleteFileErrorIfNotExist(@NotNull final String fileKey) {
        if (fileNotExisting(fileKey)) {
            throw new IllegalArgumentException("File to delete does not exist");
        }

        try {
            s3Client.deleteObject(new DeleteObjectRequest(configuration.bucketName, fileKey));
        } catch (Exception e) {
            e.printStackTrace();
            throw new ExternalApiException();
        }
    }

    @Override
    public boolean fileNotExisting(@NotNull String fileKey) {
        return !s3Client.doesObjectExist(configuration.bucketName, fileKey);
    }
}
