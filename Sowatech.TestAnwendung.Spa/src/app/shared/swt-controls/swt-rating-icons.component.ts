import { Component, Input } from '@angular/core';

import { LoggerService } from '../utilities/logger.service';

@Component({
    selector: 'rating-icons',
    template: `<i *ngFor="let r of fullArray" [ngClass]="iconCssClass"></i><i *ngFor="let e of emptyArray" [ngClass]="emptyIconCssClass">
`
})

export class RatingIconsComponent {
    constructor(private logger: LoggerService) {
    }

    @Input() iconCssClass: string = "fa fa-star";
    @Input() emptyIconCssClass: string = "fa fa-star-o";

    @Input() set rating(value: number) {
        this._rating = value;
        this.refreshArrays();
    }

    @Input() set maxRating(value: number) {
        this._maxRating = value;
        this.refreshArrays();
    }

    _rating: number = 0;
    _maxRating: number = 0;
    fullArray: number[] = [];
    emptyArray: number[] = [];

    private refreshArrays() {
        this.fullArray = [];
        for (var i = 0; i < this._rating; i++) this.fullArray.push(i + 1);

        this.emptyArray = [];
        for (var i = this._rating; i < this._maxRating; i++) this.emptyArray.push(i + 1);
    }


}