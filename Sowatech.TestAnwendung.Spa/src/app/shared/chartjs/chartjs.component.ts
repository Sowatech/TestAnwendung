import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartData, ChartDataSet, ChartOptions } from 'chart.js';
import * as datalabels from 'chartjs-plugin-datalabels';

@Component({
    selector: 'chartjs',
    template: `<div><canvas #chartCanvas width="400" height="400"></canvas></div>`
})

export class ChartJsComponent implements OnInit, OnChanges {
    constructor() {
    }

    @Input() type: 'bar' | 'line' | 'radar' | 'pie' | 'polarArea' | 'doughnut' | 'horizontalBar' | 'bubble' | string = 'bar';
    @Input() data: ChartData;;
    @Input() options: ChartOptions;

    @ViewChild('chartCanvas') set setChartCanvas(chartCanvasRef: ElementRef) {
        this.chartCanvas = chartCanvasRef.nativeElement;
    }
    chartCanvas: HTMLCanvasElement;
    private chart: Chart;

    ngOnInit() {
    }

    ngOnChanges() {
        this.refresh();
    }

    refresh() {
        if (this.data) {
            if (this.chart) {
                this.chart.update();
            }
            else {
                this.chart = new Chart(this.chartCanvas, {
                    type: this.type,
                    data: this.data,
                    options: this.options,
                    plugins: [datalabels]
                })
            }
        }
    }
}

@Component({
    selector: 'chartjs-bar',
    template: `<chartjs #chartjs type='bar'></chartjs>`
})

export class ChartJsBarComponent implements OnInit, OnChanges {
    constructor() {

        this.data = {
            labels: ["12", "19", "3", "5", "2", "3"],
            datasets: new Array<ChartDataSet>()
        }

        this.data.datasets.push(
            {
                label: 'Values',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: ChartJsHelper.getDefaultBackgroundColor(),
                borderColor: ChartJsHelper.getDefaultBorderColor(),
                borderWidth: 0,
                datalabels: { display: false }
            }
        );
        this.options = ChartJsHelper.getDefaultOptionsForBarChart();

    }

    @ViewChild('chartjs') chartjs: ChartJsComponent;
    @Input() options: ChartOptions;
    @Input('values') set values(values: number[]) {
        this.data.datasets[0].data = values;
    }
    @Input('labels') set labels(values: string[]) {
        this.data.labels = values;
    }
    @Input('label') set label(value: string) {
        this.data.datasets[0].label = value;
    }
    @Input('colors') set colors(values: string[]) {
        this.data.datasets[0].backgroundColor = values;
    }
    @Input('borderColors') set borderColors(values: string[]) {
        this.data.datasets[0].borderColor = values;
    }
    @Input('title') set title(value: string) {
        this.options.title.text = value;
    }
    @Input('datasets') set datasets(datasets: Array<ChartDataSet>) {
        this.data.datasets = datasets;
        for (let i = 0; i < this.data.datasets.length; i++) {
            let currentDataset: ChartDataSet = this.data.datasets[i];
            currentDataset.backgroundColor = ChartJsHelper.getDefaultBackgroundColor()[i];
            currentDataset.borderColor = ChartJsHelper.getDefaultBorderColor()[i];
        }
    }
    //Einstellungen des Plugins
    // https://chartjs-plugin-datalabels.netlify.com/options.html#style-options
    @Input('datalabels') set datalabels(datalabels: any) {
        this.data.datasets[0].datalabels = datalabels;
    }
    ngOnInit() {
        this.chartjs.data = this.data;
        this.chartjs.options = this.options;
    }

    ngOnChanges() {

        this.chartjs.refresh();//das sollte eigtl nicht nötig sein. 
    }

    private data: ChartData;
}


@Component({
    selector: 'chartjs-bar-datasets',
    template: `<chartjs #chartjs type='bar'></chartjs>`
})

export class ChartJsBarDatasetsComponent implements OnInit, OnChanges {
    constructor() {

        this.data = {
            labels: ["12", "19", "3", "5", "2", "3"],
            datasets: new Array<ChartDataSet>()
        }

        this.data.datasets.push(
            {
                label: 'Values',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: ChartJsHelper.getDefaultBackgroundColor(),
                borderColor: ChartJsHelper.getDefaultBorderColor(),
                borderWidth: 0,
                datalabels: { display: false }
            }
        );
        this.options = ChartJsHelper.getDefaultOptionsForBarChart();

    }

    @ViewChild('chartjs') chartjs: ChartJsComponent;
    @Input() options: ChartOptions;

    @Input('colors') set colors(values: string[]) {
        this.data.datasets[0].backgroundColor = values;
    }
    @Input('borderColors') set borderColors(values: string[]) {
        this.data.datasets[0].borderColor = values;
    }
    @Input('title') set title(value: string) {
        this.options.title.text = value;
    }
    @Input('datasetsObject') set datasets(datasetsObject: ObjectForDataSetChart) {
        this.data.labels = datasetsObject.chartLabels;
        this.data.datasets = datasetsObject.ListOfDataSetObjects;

        for (let i = 0; i < this.data.datasets.length; i++) {
            let currentDataset: ChartDataSet = this.data.datasets[i];
            currentDataset.backgroundColor = ChartJsHelper.getDefaultBackgroundColor()[i];
            currentDataset.borderColor = ChartJsHelper.getDefaultBorderColor()[i];
        }
    }

    //Einstellungen des Plugins
    // https://chartjs-plugin-datalabels.netlify.com/options.html#style-options
    @Input('datalabels') set datalabels(datalabels: any) {
        this.data.datasets[0].datalabels = datalabels;
    }
    ngOnInit() {
        this.chartjs.data = this.data;
        this.chartjs.options = this.options;
    }

    ngOnChanges() {
        this.chartjs.refresh();//das sollte eigtl nicht nötig sein. 
    }

    private data: ChartData;

}

export interface ObjectForDataSetChart {
    chartLabels: Array<string>;
    ListOfDataSetObjects: Array<DataSetObject>;
}

export interface DataSetObject {
    label: string;
    data: Array<number>;
}



@Component({
    selector: 'chartjs-pie',
    template: `<chartjs #chartjs type='pie'></chartjs>`
})

export class ChartJsPieComponent implements OnInit, OnChanges {
    constructor() {

        this.data = {
            labels: ["12", "19", "3", "5", "2", "3"],
            datasets: new Array<ChartDataSet>(),
        }

        this.data.datasets.push(
            {
                label: 'Values',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: ChartJsHelper.getDefaultBackgroundColor(),
                borderColor: ChartJsHelper.getDefaultBorderColor(),
                borderWidth: 0,
                datalabels: { display: false }
            }
        );
        this.options = ChartJsHelper.getDefaultOptionsForPieChart();
    }

    @ViewChild('chartjs') chartjs: ChartJsComponent;
    @Input() options: ChartOptions;
    @Input('values') set values(values: number[]) {
        this.data.datasets[0].data = values;
    }
    @Input('labels') set labels(values: string[]) {
        this.data.labels = values;
    }
    @Input('colors') set colors(values: string[]) {
        this.data.datasets[0].backgroundColor = values;
    }
    @Input('borderColors') set borderColors(values: string[]) {
        this.data.datasets[0].borderColor = values;
    }
    @Input('title') set title(value: string) {
        this.options.title.text = value;
    }

    ngOnInit() {
        this.chartjs.data = this.data;
        this.chartjs.options = this.options;
    }

    ngOnChanges() {
        this.chartjs.refresh();//das sollte eigtl nicht nötig sein. 
    }
    //Einstellungen des Plugins
    // https://chartjs-plugin-datalabels.netlify.com/options.html#style-options
    @Input('datalabels') set datalabels(datalabels: any) {
        this.data.datasets[0].datalabels = datalabels;
    }
    private data: ChartData;
}

@Component({
    selector: 'chartjs-line',
    template: `<chartjs #chartjs type='line'></chartjs>`
})

export class ChartJsLineComponent implements OnInit, OnChanges {
    constructor() {

        this.data = {
            labels: ["January", "February", "March", "April", "May", "June", "July"],
            datasets: new Array<ChartDataSet>(),
        }

        this.data.datasets.push(
            {
                label: "My First dataset",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                spanGaps: false,
                data: [65, 59, 80, 81, 56, 55, 40],
                datalabels: { display: false }
            }
        );
        this.options = ChartJsHelper.getDefaultOptionsForLineChart();
    }

    @ViewChild('chartjs') chartjs: ChartJsComponent;
    @Input() options: ChartOptions;
    @Input('datasets') set datasets(values: ChartDataSet[]) {
        this.data.datasets = values;
    }
    @Input('labels') set labels(values: string[]) {
        this.data.labels = values;
    }
    @Input('colors') set colors(values: string[]) {
        this.data.datasets[0].backgroundColor = values;
    }
    @Input('borderColors') set borderColors(values: string[]) {
        this.data.datasets[0].borderColor = values;
    }
    @Input('title') set title(value: string) {
        this.options.title.text = value;
    }

    ngOnInit() {
        this.chartjs.data = this.data;
        this.chartjs.options = this.options;
    }

    ngOnChanges() {
        this.chartjs.refresh();//das sollte eigtl nicht nötig sein. 
    }
    //Einstellungen des Plugins
    // https://chartjs-plugin-datalabels.netlify.com/options.html#style-options
    @Input('datalabels') set datalabels(datalabels: any) {
        this.data.datasets[0].datalabels = datalabels;
    }
    private data: ChartData;
}

class ChartJsHelper {
    public static getDefaultBackgroundColor(): string[] {
        return [
            'rgba(28, 131, 198, 0.6)',
            'rgba(35, 200, 200, 0.6)',
            'rgba(26, 179, 149, 0.6)',
            'rgba(103, 106, 108, 0.6)',
            //            'rgba(209, 218, 222, 0.6)', nochmal anschauen, welches grau wir nehmen
            'rgba(0, 120, 96, 0.6)',
            'rgba(5, 80, 129, 0.6)'

        ]
    }

    public static getDefaultBorderColor(): string[] {
        return [
            'rgba(28, 131, 198, 1)',
            'rgba(35, 200, 200, 1)',
            'rgba(26, 179, 149, 1)',
            'rgba(103, 106, 108, 1)',
            //    'rgba(209, 218, 222, 1)',
            'rgba(0, 120, 96, 1)',
            'rgba(5, 80, 129, 1)'
        ]
    }



    public static getDefaultOptionsForPieChart(): ChartOptions {
        let options: ChartOptions =
            {
                title: { text: "Pie-Chart", display: true },
                responsive: true
            };
        return options;
    }

    public static getDefaultOptionsForLineChart(): ChartOptions {
        let options: ChartOptions =
            {
                title: { text: "Line-Chart", display: true },
                responsive: true
            };
        return options;
    }

    public static getDefaultOptionsForBarChart(): ChartOptions {
        let options: ChartOptions =
            {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                title: { text: "Bar-Chart", display: true },
                responsive: true
            };
        return options;
    }

}
