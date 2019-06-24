import {ClientDto}from'../client-web-api.service';

export class ClientDetailModel {

    constructor(dto: ClientDto) {
        for (var prop in dto) {
            this[prop] = dto[prop];
        }
    }

    public id: number;
    public name: string;
    public accessEnd: Date;
    public accessStart: Date;

    public created: Date;
    public createdBy: string;
    public edited: Date;
    public editedBy: string;
}