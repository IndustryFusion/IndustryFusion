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

package io.fusion.fusionbackend.service;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import io.fusion.fusionbackend.config.FusionBackendConfig;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.TransportConfigCallback;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.transport.SshSessionFactory;
import org.eclipse.jgit.transport.SshTransport;
import org.eclipse.jgit.transport.ssh.jsch.JschConfigSessionFactory;
import org.eclipse.jgit.util.FS;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Service
@Slf4j
public class ModelRepoSyncService {
    private final FusionBackendConfig fusionBackendConfig;
    @Value("${java.io.tmpdir}")
    private String tmpdir;
    private Git git;
    private TransportConfigCallback transportConfigCallback;

    public ModelRepoSyncService(FusionBackendConfig fusionBackendConfig) {
        this.fusionBackendConfig = fusionBackendConfig;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        if (Boolean.TRUE.equals(fusionBackendConfig.getModelRepoSyncActive())) {
            this.transportConfigCallback = createNewTransportConfigCallback();
            if (createAndValidateModelRepoLocal()) {
                log.info("Git repo {} up to date: ", getLocalGitPath());
            }
        }
    }

    private boolean createAndValidateModelRepoLocal() {
        Path localGitPath = getLocalGitPath();
        if (!Files.exists(localGitPath)) {
            try {
                Files.createDirectories(localGitPath);
            } catch (IOException e) {
                log.warn("Could not create local model repo path {}: {}", localGitPath, e);
                return false;
            }
        }
        if (!isGitRepo(localGitPath)) {
            try {
                final boolean isDirectoryEmpty = isDirectoryEmpty(localGitPath);
                if (!isDirectoryEmpty) {
                    log.warn("Directory not empty {}", localGitPath);
                    return false;
                }
            } catch (IOException e) {
                log.warn("Error while checking directory empty {}: {}", localGitPath, e);
                return false;
            }
            try {
                git = Git.cloneRepository()
                        .setURI(fusionBackendConfig.getModelRepoUrl())
                        .setDirectory(localGitPath.toFile())
                        .setTransportConfigCallback(transportConfigCallback)
                        .call();
            } catch (GitAPIException e) {
                log.warn("Error cloning repo {}: {}", localGitPath, e);
                return false;
            }
        }
        try {
            Repository modelRepoTest = getRepository(localGitPath);
            String remoteUrl = modelRepoTest.getConfig().getString("remote", "origin", "url");
            if (!fusionBackendConfig.getModelRepoUrl().equals(remoteUrl)) {
                log.warn("Local model repo url does not match configuration {}: {} vs {}", localGitPath,
                        remoteUrl, fusionBackendConfig.getModelRepoUrl());
                return false;
            }
            git = new Git(modelRepoTest);
        } catch (IOException e) {
            log.warn("Error opening repo path {}: {}", localGitPath, e);
            return false;
        }
        try {
            git.pull().call();
        } catch (GitAPIException e) {
            log.warn("Error pulling repo path {}: {}", localGitPath, e);
            return false;
        }
        return true;
    }

    private String getLocalGitPathString() {
        return ensureTrailingSlash(tmpdir) + extractRepoName();
    }

    private Path getLocalGitPath() {
        return Paths.get(getLocalGitPathString());
    }

    private String extractRepoName() {
        return extractRepoName(fusionBackendConfig.getModelRepoUrl());
    }

    protected String extractRepoName(final String repoUrl) {
        if (repoUrl == null) {
            return null;
        }
        return Pattern.compile(".*/(.*?)\\.git")
                .matcher(repoUrl)
                .results()
                .map(m -> m.group(1))
                .findFirst()
                .orElse(null);
    }

    private String ensureTrailingSlash(final String value) {
        if (!value.endsWith("/")) {
            return value + "/";
        }
        return value;
    }

    private Repository getRepository(final Path path) throws IOException {
        return createRepositoryBuilder(path).build();
    }

    private FileRepositoryBuilder createRepositoryBuilder(final Path path) {
        return new FileRepositoryBuilder()
                .findGitDir(path.toFile())
                .readEnvironment();
    }

    private boolean isDirectoryEmpty(final Path path) throws IOException {
        if (Files.isDirectory(path)) {
            try (Stream<Path> entries = Files.list(path)) {
                return entries.findFirst().isEmpty();
            }
        }

        return false;
    }

    private TransportConfigCallback createNewTransportConfigCallback() {
        SshSessionFactory sshSessionFactory = new JschConfigSessionFactory() {
            @Override
            protected JSch createDefaultJSch(FS fs) throws JSchException {
                JSch defaultJSch = super.createDefaultJSch(fs);
                defaultJSch.addIdentity(fusionBackendConfig.getModelRepoPrivateKeyPath());
                return defaultJSch;
            }
        };

        return transport -> {
            if (transport instanceof SshTransport) {
                SshTransport sshTransport = (SshTransport) transport;
                sshTransport.setSshSessionFactory(sshSessionFactory);
            } else {
                throw new UnsupportedOperationException("Git repo url must be ssh!");
            }
        };
    }

    public boolean isGitRepo(Path path) {
        return createRepositoryBuilder(path).getGitDir() != null;
    }
}
