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
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import org.jetbrains.annotations.NotNull;

public interface ObjectStorageBaseClient {

    boolean existBucket(final String bucketName);

    String getFilePathForUpload(final String fileKey);

    void setMaxFileSize(final Long maxFileSizeMb);

    ObjectStorageConfiguration getConfig();

    byte[] getFile(@NotNull final String fileKey) throws ResourceNotFoundException;

    MediaObjectDto uploadFile(@NotNull final MediaObjectDto mediaObject);

    boolean existFolder(@NotNull String folderPath);

    void createFolder(@NotNull String folderPath);

    default void createFolderIfNotExists(@NotNull String folderPath) {
        if (!existFolder(folderPath)) {
            createFolder(folderPath);
        }
    }

    void deleteFile(@NotNull final String fileKey);
}
