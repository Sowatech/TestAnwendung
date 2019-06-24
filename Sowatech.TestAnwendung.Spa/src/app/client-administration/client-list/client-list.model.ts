import {ClientListDto}from'../client-web-api.service';

export class ClientListModel {

    constructor(dto: ClientListDto) {
        for (var prop in dto) {
            this[prop] = dto[prop];
        }
    }

    public id: number;
    public name: string;
    public accessEnd: Date;
    public accessStart: Date;
}