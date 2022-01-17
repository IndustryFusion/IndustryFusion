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
import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.Status;
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
        try {
            FileUtils.deleteDirectory(localGitPath.toFile());
            log.info("{} deleted", localGitPath);
        } catch (IOException e) {
            log.warn("Could not delete old model repo path {}: {}", localGitPath, e);
            return false;
        }
        try {
            Files.createDirectories(localGitPath);
        } catch (IOException e) {
            log.warn("Could not create local model repo path {}: {}", localGitPath, e);
            return false;
        }
        return checkoutRepo(localGitPath);
    }

    private boolean checkoutRepo(Path localGitPath) {
        if (!checkAndDoClone(localGitPath)) {
            return false;
        }
        if (!checkGitRepo(localGitPath)) {
            return false;
        }
        return pullRepo();
    }

    private boolean checkAndDoClone(final Path localGitPath) {
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
        return true;
    }

    private boolean checkGitRepo(final Path localGitPath) {
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
        return true;
    }

    public boolean pullRepo() {
        if (git == null) {
            return false;
        }
        try {
            git.pull().call();
        } catch (GitAPIException e) {
            log.warn("Error pulling repo", e);
            return false;
        }
        return true;
    }

    public long checkChangesAndSync() {
        long modifiedCount;
        long untrackedCount;
        if (git == null) {
            return 0;
        }
        try {
            Status status = git.status().call();
            modifiedCount = status.getModified().size();
            untrackedCount = status.getUntracked().size();
            log.info("{} modified, {} untracked", modifiedCount, untrackedCount);

            if (modifiedCount + untrackedCount > 0) {
                git.add().addFilepattern(".").call();
                log.info("added all");

                git.commit().setAll(true).setMessage("Automated Commit").call();
                log.info("commited");

                git.push().call();
                log.info("pushed");
            }
        } catch (GitAPIException e) {
            log.warn("Error pulling repo", e);
            return 0;
        }
        return modifiedCount + untrackedCount;
    }

    public Path getLocalGitPath() {
        return Paths.get(tmpdir, extractRepoName());
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
