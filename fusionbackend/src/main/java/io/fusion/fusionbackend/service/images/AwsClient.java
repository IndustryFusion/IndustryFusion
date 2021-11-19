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
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

// see https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/examples-s3-objects.html#upload-object
// and https://javatutorial.net/java-s3-example
public abstract class AwsClient {

    private static final String ENDPOINT_URL = "http://s3-de-central.profitbricks.com:80";

    protected final AmazonS3 s3Client;
    protected final String bucketName;
    protected final Long companyId;
    protected String basePath;

    public AwsClient(@NotNull final Long companyId, @NotNull final String accessKey,  @NotNull final String secretKey) {
        this.companyId = companyId;
        this.s3Client = createClient(accessKey, secretKey);
        this.bucketName = "industryfusion";
        this.basePath = "company" + companyId + "/";

        assert existBucket(this.bucketName);
    }

    private AmazonS3 createClient(final String accessKey, final String secretKey) {
        AWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
        return AmazonS3ClientBuilder
                .standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(
                        ENDPOINT_URL, "eu-west-1"))
                .build();
    }

    protected String getFilePath(final String fileKey) {
        return this.basePath + fileKey;
    }

    protected String getFileExtension(final String filename) {
        String[] parts = filename.split("\\.");
        if (parts.length < 1) {
            throw new IllegalArgumentException();
        }
        return parts[parts.length - 1];
    }

    public boolean existBucket(final String bucketName) {
        try {
            return s3Client.doesBucketExistV2(bucketName);
        } catch (Exception e) {
            return false;
        }
    }

    public byte[] getFile(@NotNull final String fileKey) throws ResourceNotFoundException {
        if (isContentTypeInvalid(getContentType(fileKey))) {
            throw new IllegalArgumentException("Content type is invalid");
        }

        try {
            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                s3Client.getObject(new GetObjectRequest(bucketName, getFilePath(fileKey))).getObjectContent()
                        .transferTo(outputStream);

                byte[] fileContent = outputStream.toByteArray();
                if (isFileSizeInvalid(fileContent)) {
                    throw new IllegalArgumentException("File size is larger than " + getMaxFileSizeMb() + " MB");
                }
                return fileContent;
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResourceNotFoundException();
        }
    }

    protected abstract String getContentType(String fileKey);

    protected abstract boolean isContentTypeInvalid(final String contentTypeLowerCase);

    public abstract Long getMaxFileSizeMb();

    protected Long getFileSizeFrom64Based(final String content64Based) {
        return content64Based.length() * 3L / 4L;
    }

    protected boolean isFileSizeInvalidBase64(final String content64Based) {
        return getFileSizeFrom64Based(content64Based) > getMaxFileSizeMb() * 1024 * 1024;
    }

    protected boolean isFileSizeInvalid(final byte[] content) {
        return content.length > getMaxFileSizeMb() * 1024 * 1024;
    }

    public Long uploadFile(@NotNull final String content64BasedWithContentType,
                           @NotNull final String contentType,
                           @NotNull final String destinationPath) {

        if (isContentTypeInvalid(contentType)) {
            throw new IllegalArgumentException("Content type is invalid");
        }
        if (isFileSizeInvalidBase64(content64BasedWithContentType)) {
            throw new IllegalArgumentException("File size is larger than " + getMaxFileSizeMb() + " MB");
        }

        String content64Based = getFileContent64BasedWithoutContentType(content64BasedWithContentType, contentType);
        byte[] fileContent = Base64.getDecoder().decode(content64Based);

        File tempFile = createTempFile(fileContent, getFileExtension(destinationPath));
        assert tempFile != null;

        try {
            createFolderIfNotExists(basePath);
            s3Client.putObject(new PutObjectRequest(bucketName, destinationPath, tempFile));

        } catch (AmazonServiceException e) {
            e.printStackTrace();
            throw new ExternalApiException();
        } finally {
            deleteTempFile(tempFile);
        }

        return (long)fileContent.length;
    }

    private String getFileContent64BasedWithoutContentType(String content64Based, final String contentType) {
        final String dataUriSchemeStartToBeRemoved = "data:" + contentType + ";base64,";
        if (content64Based.startsWith(dataUriSchemeStartToBeRemoved)) {
            content64Based = content64Based.substring(dataUriSchemeStartToBeRemoved.length());
        }
        return content64Based;
    }

    private File createTempFile(final byte[] content, final String fileExtension) {
        try {
            String tempDir = System.getProperty("java.io.tmpdir");

            File dir = new File(tempDir);
            File file = File.createTempFile(".if-", "." + fileExtension, dir);

            FileOutputStream fileOutputStream = new FileOutputStream(file.getAbsolutePath());
            fileOutputStream.write(content);
            fileOutputStream.close();

            return file;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private void deleteTempFile(File file) {
        file.deleteOnExit();
    }

    private void createFolderIfNotExists(@NotNull String folderPath) {
        if (!existFolder(folderPath)) {
            createEmptyFolder(folderPath);
        }
    }

    public boolean existFolder(@NotNull String folderPath) {
        if (!folderPath.endsWith("/")) {
            folderPath = folderPath + '/';
        }

        try {
            s3Client.getObject(new GetObjectRequest(bucketName, folderPath));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void createEmptyFolder(@NotNull String folderPath) {
        if (!folderPath.endsWith("/")) {
            folderPath = folderPath + '/';
        }

        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(0);
            InputStream emptyContent = new ByteArrayInputStream(new byte[0]);

            s3Client.putObject(new PutObjectRequest(bucketName, folderPath, emptyContent, metadata));
        } catch (Exception e) {
            e.printStackTrace();
            throw new ExternalApiException();
        }
    }

    public void deleteFile(@NotNull final String fileKey) {
        try {
            s3Client.deleteObject(new DeleteObjectRequest(bucketName, getFilePath(fileKey)));
        } catch (Exception e) {
            e.printStackTrace();
            throw new ExternalApiException();
        }
    }
}
