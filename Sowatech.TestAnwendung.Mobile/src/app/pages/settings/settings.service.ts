import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { LoggerService } from '../../shared';
import { PouchDbService, Repository } from '../../api';
import { SettingsPageModel } from './settings.model';

@Injectable()
export class SettingsApiService {
    constructor(
        private loggerService: LoggerService,
        private pouchDbService: PouchDbService
    ) {
    }

    private get settingsRepository(): Repository<SettingsPageModel> {
        return <Repository<SettingsPageModel>>this.pouchDbService.getRepository("settings");
    }

    async loadSettings(): Promise<SettingsPageModel[]> {
        let models = await this.settingsRepository.getAll();
        // let settings;
        // settings = models.length > 0 ? models[0] : null;
        // if (!settings) settings = new AppDto.DataSettingDto();
        // return settings;        
        return models
    }

    async saveSettings(data: SettingsPageModel[]): Promise<boolean> {
        let result = await this.settingsRepository.put(data);
        return !result.error;
    }
}