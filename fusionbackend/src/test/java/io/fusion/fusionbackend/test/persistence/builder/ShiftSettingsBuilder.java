package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.ShiftSettings;

import java.time.DayOfWeek;
import java.util.LinkedHashSet;

public class ShiftSettingsBuilder implements Builder<ShiftSettings> {

    private ShiftSettingsBuilder() {
    }

    public static ShiftSettingsBuilder aShiftSettings() {
        return new ShiftSettingsBuilder();
    }

    @Override
    public ShiftSettings build() {
        ShiftSettings shiftSettings = new ShiftSettings();

        shiftSettings.setWeekStart(DayOfWeek.MONDAY);
        shiftSettings.setShiftsOfDays(new LinkedHashSet<>());

        return shiftSettings;
    }
}
