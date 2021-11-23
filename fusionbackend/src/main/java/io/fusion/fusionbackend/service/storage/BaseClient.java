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

import org.jetbrains.annotations.NotNull;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

public class BaseClient {

    protected static final int MAX_LENGTH_FILE_PATH = 96;
    protected static final int MAX_LENGTH_FILE_NAME = 96;
    protected static final int UUID_EXTRA_SPACE = UUID.randomUUID().toString().length() + 1;

    protected String getFileContent64BasedWithoutContentType(String content64Based, final String contentType) {
        final String dataUriSchemeStartToBeRemoved = "data:" + contentType + ";base64,";
        if (content64Based.startsWith(dataUriSchemeStartToBeRemoved)) {
            content64Based = content64Based.substring(dataUriSchemeStartToBeRemoved.length());
        }
        return content64Based;
    }

    protected File createTempFile(final byte[] imageContent, final String fileExtension) {
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

    protected void deleteTempFile(File file) {
        file.deleteOnExit();
    }

    public static Long getFileSizeFrom64Based(final String content64Based) {
        return content64Based.length() * 3L / 4L;
    }

    protected boolean isFileSizeInvalidBase64(final String content64Based,
                                            final ObjectStorageConfiguration configuration) {
        return getFileSizeFrom64Based(content64Based) > configuration.maxFileSizeMb * 1024 * 1024;
    }

    protected boolean isFileSizeInvalid(final byte[] content, final ObjectStorageConfiguration configuration) {
        return content.length > configuration.maxFileSizeMb * 1024 * 1024;
    }

    public static String getFileExtension(final String filename) {
        String[] parts = filename.split("\\.");
        if (parts.length < 1) {
            throw new IllegalArgumentException();
        }
        return parts[parts.length - 1];
    }

    protected void checkFileKey(@NotNull final String fileKey) {
        checkFileKeyGeneral(fileKey, false);
    }

    protected void checkUniqueFileKey(@NotNull final String fileKey) {
        checkFileKeyGeneral(fileKey, true);
    }

    private void checkFileKeyGeneral(@NotNull final String fileKey, boolean withUuid) {
        int uuidLengthInFilename = withUuid ? UUID_EXTRA_SPACE : 0;

        if (isFileKeyContentInvalid(fileKey)) {
            String exceptionMessage = "File key contains illegal character(s)";
            throw new IllegalArgumentException(exceptionMessage);
        }
        if (fileKey.length() > MAX_LENGTH_FILE_NAME + MAX_LENGTH_FILE_PATH + uuidLengthInFilename) {
            String exceptionMessage = "File key is too large";
            throw new IllegalArgumentException(exceptionMessage);
        }

        Path path = Paths.get(fileKey);
        String fileName = path.getFileName().toString();
        String filePath = path.getParent() != null ? path.getParent().toString() : "";

        if (fileName.length() > MAX_LENGTH_FILE_NAME + uuidLengthInFilename) {
            String exceptionMessage = "File name is larger than " + MAX_LENGTH_FILE_NAME;
            throw new IllegalArgumentException(exceptionMessage);
        }
        if (filePath.length() > MAX_LENGTH_FILE_PATH) {
            String exceptionMessage = "File path is larger than " + MAX_LENGTH_FILE_PATH;
            throw new IllegalArgumentException(exceptionMessage);
        }
    }

    private boolean isFileKeyContentInvalid(final String fileKey) {
        return fileKey == null || fileKey.contains("?") || fileKey.contains("\\")
                || fileKey.contains("<") || fileKey.contains(">") || fileKey.contains("*")
                || fileKey.contains("|") || fileKey.contains(":") || fileKey.contains("\"")
                || fileKey.contains("=") || fileKey.contains("@") || fileKey.contains("%");
    }

    public static String createUniqueFileKey(@NotNull final String fileKey) {
        Path path = Paths.get(fileKey);
        String fileName = path.getFileName().toString();
        String filePath = path.getParent() != null ? path.getParent().toString() : "";
        return filePath + "/" + UUID.randomUUID() + "_" + fileName;
    }

    public static String getFileNameFromUniqueFileKey(@NotNull final String fileKey) {
        String fileName = Paths.get(fileKey).getFileName().toString();
        return fileName.substring(UUID_EXTRA_SPACE);
    }
}
