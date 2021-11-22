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

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class BaseClient {

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
}
