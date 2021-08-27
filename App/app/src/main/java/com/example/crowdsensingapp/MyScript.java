package com.example.crowdsensingapp;

public class MyScript {

    private int nNeighbour = 1;
    private int range;

    public MyScript(int neigh, int range){
        this.nNeighbour=neigh;
        this.range=range;

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





}
