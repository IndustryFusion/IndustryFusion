package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.Shift;
import io.fusion.fusionbackend.model.ShiftsOfDay;

public class ShiftBuilder implements Builder<Shift> {

    private ShiftsOfDay shiftsOfDay;

    private ShiftBuilder() {
    }

    public static ShiftBuilder aShift() {
        return new ShiftBuilder();
    }

    public ShiftBuilder forShiftsOfDay(Builder<ShiftsOfDay> shiftsOfDayBuilder) {
        this.shiftsOfDay = shiftsOfDayBuilder.build();
        return this;
    }


    @Override
    public Shift build() {
        Shift shift = new Shift();

        if (shiftsOfDay == null) {
            shiftsOfDay = ShiftsOfDayBuilder.aShiftsOfDay().build();
            throw new NullPointerException("Please provide persisted shifts of day");
        }
        shift.setShiftsOfDay(shiftsOfDay);
        shiftsOfDay.getShifts().add(shift);

        shift.setName(TEST_STRING);
        shift.setStartMinutes(6 * 60L);
        shift.setEndMinutes(17 * 60L);

        return shift;
    }
}
