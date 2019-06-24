import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

import { LoggerService } from '../shared';
import { PouchDbService, Repository } from '../api';

import { DataImageGalleryDto } from '../../app/app.dto';

@Injectable()
export class LocalApiService {
    constructor(
        private loggerService: LoggerService,
        private pouchDbService: PouchDbService
    ) {
    }

    private get imageRepository(): Repository<DataImageGalleryDto> {
        return <Repository<DataImageGalleryDto>>this.pouchDbService.getRepository("images");
    }

    // saveImage(dto: DataImageGalleryDto): Observable<boolean> {
    //     return this.imageRepository.put(dto)
    //         .flatMap(val => Observable.of(val.ok));
    // }

    // loadImages(): Observable<Array<DataImageGalleryDto>> {
    //     return this.imageRepository.getAll();
    // }

    // deleteImage(id: string): Observable<number> {
    //     return this.imageRepository.delete(<string[]>[id]);
    // }

    async clearAll(): Promise<void> {
        this.loggerService.log("LocalApiService.clearAll");

        return Promise.resolve();
    }
}