package io.fusion.fusionbackend.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SyncResultDto {
    int newFileCount;
    int modifiedFileCount;
}
