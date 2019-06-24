import { Injectable, EventEmitter } from '@angular/core';
import { LoggerService } from './logger.service';
import { SessionDataDto } from "../../session.dtos";

@Injectable()
export class Session {
    constructor(private loggerService: LoggerService) {
    }

    public sessionChanged = new EventEmitter<SessionDataDto>();
    private sessionData: SessionDataDto;
    private storePrefix = "Session.";

    public get Data(): SessionDataDto {
        return this.getData<SessionDataDto>();
    }

    public set Data(dto: SessionDataDto) {
        this.setData<SessionDataDto>(dto);
    }
    
    public getData<T extends SessionDataDto>(): T {
        if (!this.sessionData) {
            try {
                this.sessionData = JSON.parse(localStorage.getItem(this.storePrefix));
            }
            catch(e){
                this.loggerService.warn("Session.get UserData / exception: " + e);
            }
        }
        return <T>this.sessionData;
    }

    public setData<T extends SessionDataDto>(dto: T) {
        this.loggerService.log("Session.setData");
        this.sessionData = dto;
        if (this.sessionData) {
            localStorage.setItem(this.storePrefix, JSON.stringify(this.sessionData))
        }
        else {
            this.clearStore();
        }
        this.sessionChanged.emit(this.sessionData);
    }

    public clearData() {
        this.sessionData = null;
        this.sessionChanged.emit(this.sessionData);
        this.clearStore();
    }

    private clearStore() {
        this.loggerService.log("Session.clearStore");
        for (var i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key.startsWith(this.storePrefix)) {
                localStorage.removeItem(key);
            }
        }
    }
}
