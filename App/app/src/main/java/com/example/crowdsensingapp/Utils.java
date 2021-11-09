package com.example.crowdsensingapp;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Utils is used to define static utility functions
 */
public class Utils {

    /**
     *
     *  round is used to round a value of places elements
     * @param value is the target number
     * @param places is the number of the decimaml digits
     * @return the rounded value
     */
    public static double round(double value, int places) {
        if (places < 0) throw new IllegalArgumentException();

        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }

    public static double obfuscate(double value, int truncation){
        //moves the decimal to the right
        value = value* Math.pow(10, truncation);
        //determines the floor value
        value = Math.floor(value);
        //dividing the floor value by 10 to the power decimalplace
        value = value / Math.pow(10, truncation);
        return value;
    }
}
