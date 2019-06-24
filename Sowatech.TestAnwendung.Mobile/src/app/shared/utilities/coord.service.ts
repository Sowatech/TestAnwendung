import { Injectable } from '@angular/core';

@Injectable()
export class CoordService {

    public getDistanceFromLatLongInKm(coord1: Coord, coord2: Coord): number {
        let radiusEarth: number = 6371; // Radius of the earth in km
        let dLat: number = this.toRad(coord2.lat - coord1.lat);  // deg2rad below
        let dLong: number = this.toRad(coord2.long - coord1.long);
        let a: number =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(coord1.lat)) * Math.cos(this.toRad(coord2.lat)) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2)
            ;
        let c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let distanceKilometer: number = radiusEarth * c;
        return distanceKilometer;
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

}

export class Coord {
    constructor(lat: number, long: number) {
        this.lat = lat;
        this.long = long;
    }

    lat: number;
    long: number;
}