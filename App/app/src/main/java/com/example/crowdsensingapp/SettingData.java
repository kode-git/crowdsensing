package com.example.crowdsensingapp;

import java.util.Objects;

public class SettingData {

    private int nNeighbour = 1;
    private int range;
    private int minutesTime;

    public SettingData(int neigh, int range, int minutesTime){
        this.nNeighbour=neigh;
        this.range=range;
        this.minutesTime=minutesTime;

    }

    // Getting and setting methods

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
