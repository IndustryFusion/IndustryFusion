package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.ShiftSettings;
import io.fusion.fusionbackend.model.ShiftsOfDay;
import io.fusion.fusionbackend.model.enums.DayType;

import java.util.LinkedHashSet;

public class ShiftsOfDayBuilder implements Builder<ShiftsOfDay> {

    private ShiftSettings shiftSettings;

    private ShiftsOfDayBuilder() {
    }

    public static ShiftsOfDayBuilder aShiftsOfDay() {
        return new ShiftsOfDayBuilder();
    }

    public ShiftsOfDayBuilder forShiftSettings(Builder<ShiftSettings> shiftSettingsBuilder) {
        this.shiftSettings = shiftSettingsBuilder.build();
        return this;
    }

    public ShiftsOfDayBuilder forShiftSettings(ShiftSettings shiftSettings) {
        this.shiftSettings = shiftSettings;
        return this;
    }

    @Override
    public ShiftsOfDay build() {
        ShiftsOfDay shiftsOfDay = new ShiftsOfDay();

        if (shiftSettings == null) {
           throw new NullPointerException("Please provide persisted shift settings");
        }
        shiftsOfDay.setShiftSettings(shiftSettings);
        shiftSettings.getShiftsOfDays().add(shiftsOfDay);

        shiftsOfDay.setDay(DayType.MONDAY);
        shiftsOfDay.setIsActive(true);
        shiftsOfDay.setShifts(new LinkedHashSet<>());

        return shiftsOfDay;
    }
}
