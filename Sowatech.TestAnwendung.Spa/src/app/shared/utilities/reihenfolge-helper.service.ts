//import { Injectable } from '@angular/core';
//@Injectable()
export class ReihenfolgeHelperService {
    public static VerschiebeObjektZuReihenfolge(list: Array<IObjectWithReihenfolge>, obj: IObjectWithReihenfolge, newReihenfolge: number) {

        if (newReihenfolge <= 0) newReihenfolge = 1;

        let dropDirection: DropDirection = obj.Reihenfolge > newReihenfolge ? DropDirection.upwards : (obj.Reihenfolge < newReihenfolge ? DropDirection.downwards : DropDirection.atpos);

        switch (dropDirection) {
            case DropDirection.downwards:
                newReihenfolge = newReihenfolge - 1;
                list = list.filter(li => li.Reihenfolge > obj.Reihenfolge && li.Reihenfolge <= newReihenfolge);
                for (let a of list) {
                    a.Reihenfolge = a.Reihenfolge - 1;
                }
                break;
            case DropDirection.upwards:
            case DropDirection.atpos:
                list = list.filter(li => li.Reihenfolge < obj.Reihenfolge && li.Reihenfolge >= newReihenfolge);
                for (let a of list) {
                    a.Reihenfolge = a.Reihenfolge + 1;
                }
                break;
        }

        obj.Reihenfolge = newReihenfolge;
    }

    public static NewNummerieren(list: Array<IObjectWithReihenfolge>) {
        let r = 1;
        for (let a of list.sort((a, b) => a.Reihenfolge > b.Reihenfolge ? 1 : b.Reihenfolge > a.Reihenfolge ? -1 : 0)) {
            a.Reihenfolge = r;
            r++;
        }
    }

    public static GetMaxReihenfolge(list: Array<IObjectWithReihenfolge>): number {
        return list.length > 0 ? Math.max.apply(Math, list.map((li => li.Reihenfolge))) : -1;
    }
}

interface IObjectWithReihenfolge {
    Reihenfolge: number;
}

enum DropDirection { upwards, downwards, atpos }