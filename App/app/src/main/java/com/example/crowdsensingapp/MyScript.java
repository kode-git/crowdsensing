package com.example.crowdsensingapp;

public class MyScript {

    private int nNeighbour = 1;
    private int range;
    private int minutesTime;



    public MyScript(int neigh, int range, int minutesTime){
        this.nNeighbour=neigh;
        this.range=range;
        this.minutesTime=minutesTime;

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



}
