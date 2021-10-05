package com.example.crowdsensingapp;

import java.util.Objects;

public class SettingData {

    private int nNeighbour = 1;
    private int range;
    private int minutesTime;
    private int to;
    private boolean privacyOnOff;
    private boolean defaultOnOff;




    public SettingData(int neigh, int range, int minutesTime, boolean prvc, boolean def, int to){
        this.nNeighbour=neigh;
        this.range=range;
        this.minutesTime=minutesTime;
        this.privacyOnOff = prvc;
        this.defaultOnOff = def;
        this.to=to;

    }

    // Getter and setter methods
    public int getTo() {
        return to;
    }

    public void setTo(int to) {
        this.to = to;
    }

    public boolean isDefaultOnOff() {
        return defaultOnOff;
    }

    public void setDefaultOnOff(boolean defaultOnOff) {
        this.defaultOnOff = defaultOnOff;
    }

    public boolean isPrivacyOnOff() {
        return privacyOnOff;
    }

    public void setPrivacyOnOff(boolean privacyOnOff) {
        this.privacyOnOff = privacyOnOff;
    }

    public int getnNeighbour() {
        return nNeighbour;
    }

    public void setnNeighbour(int nNeighbour) {
        this.nNeighbour = nNeighbour;
    }

    public int getRange() {
        return range;
    }

    public void setRange(int range) {
        this.range = range;
    }

    public int getMinutesTime() {
        return minutesTime;
    }

    public void setMinutesTime(int minutesTime) {
        this.minutesTime = minutesTime;
    }

    // Equals, hashCode and toString methods
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SettingData that = (SettingData) o;
        return nNeighbour == that.nNeighbour && range == that.range && minutesTime == that.minutesTime;
    }

    @Override
    public int hashCode() {
        return Objects.hash(nNeighbour, range, minutesTime);
    }

    @Override
    public String toString() {
        return "SettingData{" +
                "nNeighbour=" + nNeighbour +
                ", range=" + range +
                ", minutesTime=" + minutesTime +
                '}';
    }
}
