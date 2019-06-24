import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    ChartJsBarComponent,
    ChartJsBarDatasetsComponent,
    ChartJsComponent,
    ChartJsLineComponent,
    ChartJsPieComponent,
} from './chartjs.component';

//--- export
export { ChartData, ChartDataSet, ChartConfiguration, Color, Image } from 'chart.js';

@NgModule({
    imports: [CommonModule],
    declarations: [ChartJsComponent, ChartJsBarComponent, ChartJsBarDatasetsComponent, ChartJsPieComponent, ChartJsLineComponent],
    exports: [ChartJsComponent, ChartJsBarComponent, ChartJsBarDatasetsComponent, ChartJsPieComponent, ChartJsLineComponent]
})
export class ChartJsModule { }