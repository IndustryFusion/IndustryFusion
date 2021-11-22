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
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import io.fusion.fusionbackend.exception.ExternalApiException;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import org.jetbrains.annotations.NotNull;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.util.Base64;

// see https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/examples-s3-objects.html#upload-object
// and https://javatutorial.net/java-s3-example
public class AwsClient extends BaseClient implements ObjectStorageBaseClient {

    private final ObjectStorageConfiguration configuration;
    private final AmazonS3 s3Client;
    private final String basePath;

    public AwsClient(@NotNull final ObjectStorageConfiguration configuration) {
        assert configuration.isValid();

        this.s3Client = createClient(configuration.accessKey, configuration.secretKey, configuration.endpointUrl);
        this.basePath = "company" + configuration.companyId + "/";
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
    public String getFilePath(final String fileKey) {
        return this.basePath + fileKey;
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
    public byte[] getFile(@NotNull final String fileKey) throws ResourceNotFoundException {
        try {
            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                s3Client.getObject(new GetObjectRequest(configuration.bucketName, getFilePath(fileKey)))
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
    public Long uploadFile(@NotNull final String content64BasedWithContentType,
                           @NotNull final String contentType,
                           @NotNull final String destinationPath) {

        if (isFileSizeInvalidBase64(content64BasedWithContentType, configuration)) {
            throw new IllegalArgumentException("File size is larger than " + configuration.maxFileSizeMb + " MB");
        }

        String content64Based = getFileContent64BasedWithoutContentType(content64BasedWithContentType, contentType);
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

        return (long)fileContent.length;
    }

    @Override
    public boolean existFolder(@NotNull String folderPath) {
        if (!folderPath.endsWith("/")) {
            folderPath = folderPath + '/';
        }

        try {
            s3Client.getObject(new GetObjectRequest(configuration.bucketName, folderPath));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void createFolder(@NotNull String folderPath) {
        if (!folderPath.endsWith("/")) {
            folderPath = folderPath + '/';
        }

        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(0);
            InputStream emptyContent = new ByteArrayInputStream(new byte[0]);

            s3Client.putObject(new PutObjectRequest(configuration.bucketName, folderPath, emptyContent, metadata));
        } catch (Exception e) {
            e.printStackTrace();
            throw new ExternalApiException();
        }
    }

    @Override
    public void deleteFile(@NotNull final String fileKey) {
        try {
            s3Client.deleteObject(new DeleteObjectRequest(configuration.bucketName, getFilePath(fileKey)));
        } catch (Exception e) {
            e.printStackTrace();
            throw new ExternalApiException();
        }
    }
}
