declare module "chart.js" {
    class Chart {
        constructor(ctx: HTMLCanvasElement, settings: ChartConfiguration);
        destroy: () => void;
        update: (duration?: number, lazy?: boolean) => void;        // duration is the time for the animation of the redraw in miliseconds, lazy is a boolean. if true, the animation can be interupted by other animations
        render: (duration, lazy) => void;
        stop: () => void;
        resize: () => void;
        toBase64Image: () => string;
        clear: () => void;
        generateLegend: () => string;//Returns an HTML string of a legend for that chart.The legend is generated from the legendCallback in the options.

    }

    interface ChartConfiguration {
        type: 'bar' | 'line' | 'radar' | 'pie' | 'polarArea' | 'doughnut' | 'horizontalBar' | 'bubble' | string;
        data?: ChartData;
        options?: ChartOptions;
        plugins: Array<any>;
    }

    interface ChartData {
        labels?: string[]; // x axis labels. It's necessary for charts: line, bar and radar. And just labels (on hover) for charts: polarArea, pie and doughnut
        datasets: ChartDataSet[];
    }

    interface ChartDataSet {
        hidden?: boolean;
        label: string;
        data: number[] | number[][]; //set of points of the chart, it should be Array<number[]> only for line, bar and radar, otherwise number[];
        backgroundColor?: string | Color | string[] | Color[];
        borderColor?: string | Color | string[] | Color[];
        borderWidth?: number;
        borderCapStyle?: string; //Cap style of the line
        borderDash?: Array<number>; //Length and spacing of dashes
        borderDashOffset?: number; //Offset for line dashes
        borderJoinStyle?: string; //Line joint style
        pointBorderColor?: Color | Array<Color>; //The border color for points
        pointBackgroundColor?: Color | Array<Color>; //The fill color for points
        pointBorderWidth?: number | Array<number>; //The width of the point border in pixels
        pointRadius?: number | Array<number>; //The radius of the point shape. If set to 0, nothing is rendered.
        pointHoverRadius?: number | Array<number>; //The radius of the point when hovered
        pointHitRadius?: number | Array<number>; //The pixel size of the non-displayed point that reacts to mouse events
        pointHoverBackgroundColor?: Color | Array<Color>; //Point background color when hovered
        pointHoverBorderColor?: Color | Array<Color>; //Point border color when hovered
        pointHoverBorderWidth?: number | Array<number>;  //Border width of point when hovered
        pointStyle?: string | Array<string> | Image | Array<Image>; //The style of point. Options are 'circle', 'triangle', 'rect', 'rectRot', 'cross', 'crossRot', 'star', 'line', and 'dash'. If the option is an image, that image is drawn on the canvas using drawImage
        showLine?: boolean; //If false, the line is not drawn for this dataset
        spanGaps?: boolean; //If true, lines will be drawn between points with no or null data
        steppedLine?: boolean; //If true, the line is shown as a steeped line and 'lineTension' will be ignored
        xAxisIS?: number;
        yAxisID?: string;
        fill?: boolean; // If true, fill the area under the line
        lineTension?: number; // Bezier curve tension of the line. Set to 0 to draw straightlines. Note This was renamed from 'tension' but the old name still works.
        hoverBackgroundColor?: string | Color | string[] | Color[];
        hoverBorderColor?: string | Color | string[] | Color[];
        hoverBorderWidth?: number | number[];
        hitRadius?: number | Array<number>; //The pixel size of the non-displayed point that reacts to mouse events (only Radar?)
        datalabels?:any;//chart datalabels plugin 
    }

    interface ChartOptions {
        scales?: Scales;
        responsive?: boolean;
        responsiveAnimationDuration?: number;
        maintainAspectRatio?: boolean;
        title?: Title;
        legend?: Legend;
        elements?: OptionElement;
        hover?: Hover;
        hoverMode?: 'label' | string;
        hoverAnimationDuration?: number;
        stacked?: boolean;
        tooltips?: Tooltip;
        animation?: Animation;
        cutoutPercentage?: Number;
        rotation?: Number;
        circumference?: Number;
        events?: Array<string>; //Events that the chart should listen to for tooltips and hovering
        onClick?: Function; //Called if the event is of type 'mouseup' or 'click'. Called in the context of the chart and passed an array of active elements
        legendCallback?: (chart: Chart) => string;
        onResize?: (chart: Chart, newSize: number) => void;	// Called when a resize occurs.Gets passed two arguemnts: the chart instance and the new size
    }

    export interface Hover {
        mode?: string;
        animationDuration?: number;
        onHover?: (activeElementsAsArray: any) => void; //Called when any of the events fire. Called in the context of the chart and passed an array of active elements (bars, points, etc)


    }

    export interface Animation {
        onComplete?: (animationObject: AnimationObject) => void;
        onProgress?: (animationObject: AnimationObject) => void; //Callback called on each step of an animation. Passed a single argument, an object, containing the chart instance and an object with details of the animation.
        animateScale?: boolean;
        animateRotate?: boolean;
        easing?: string;
        duration?: number; //The number of milliseconds an animation takes.
    }


    export interface AnimationObject {
        currentStep?: number;
        numSteps?: number;
        easing?: string;
        render?: Function;
        onAnimationProgress: Function;
        onAnimationComplete: Function;

    }


    export interface Scales {
        xAxes?: AxisDefinitionX[];
        yAxes?: AxisDefinitionY[];
    }

    export interface Tooltip {
        mode: 'label' | string;
        enabled?: boolean;
        custom?: (tooltip: any) => void;
        itemSort?: Function;
        backgroundColor?: Color;
        titleFontFamily?: string;
        titleFontSize?: number;
        titleFontStyle?: string;
        titleFontColor?: Color;
        titleSpacing?: number;
        titleMarginBottom?: number;
        bodyFontFamily?: string;
        bodyFontSize?: number;
        bodyFontStyle?: string;
        bodyFontColor?: Color;
        bodySpacing?: number;
        footerFontFamily?: string;
        footerFontSize?: number;
        footerFontStyle?: string;
        footerFontColor?: Color;
        footerSpacing?: number;
        footerMarginTop?: number;
        xPadding?: number;
        ypadding?: number;
        caretSize?: number;
        cornerRadius?: number;
        multiKeyBackground: Color;
        callbacks?: CallBacksDefinition;
    }

    export interface CallBacksDefinition {
        beforeTitle?: CallBacksDefinitionObjectWithArray;
        title?: CallBacksDefinitionObjectWithArray;
        afterTitle?: CallBacksDefinitionObjectWithArray;
        beforeBody?: CallBacksDefinitionObjectWithArray;
        beforeLabel?: CallBacksDefinitionObject;
        label?: CallBacksDefinitionObject
        labelColor?: CallBacksDefinitionObjectForLabelColor;
        afterLabel?: CallBacksDefinitionObject
        afterBody?: CallBacksDefinitionObjectWithArray;
        beforeFooter?: CallBacksDefinitionObjectWithArray;
        footer?: CallBacksDefinitionObjectWithArray;
        afterFooter?: CallBacksDefinitionObjectWithArray;
    }


    export interface CallBacksDefinitionObjectForLabelColor {
        toolTipItem: ToolTipItem;
        chart: Chart;
    }


    export interface CallBacksDefinitionObject {
        toolTipItem: ToolTipItem;
        chartData: ChartData;
    }

    export interface CallBacksDefinitionObjectWithArray {
        toolTipItems: Array<ToolTipItem>;
        chartData: ChartData;
    }


    export interface ToolTipItem {
        xLabel?: string;
        yLabel?: string;
        datasetIndex?: number;
        index: number;
    }

    export interface Legend {
        position: 'left' | 'right' | 'top' | 'bottom';
        display: boolean;
        fullWidth: boolean;
        labels?: LabelsForLegendDefinition;
        onClick?: (Event, LegendItem) => void;
    }


    export interface LegendItem {
        text?: string;
        fillStyle?: Color;
        hidden?: boolean;
        lineCap?: string;
        lineDash?: Array<number>;
        lineDashOffset?: number;
        lineJoin?: string;
        lineWidth?: number;
        strokeStyle?: Color;
        pointStyle?: string;
    }


    export interface LabelsForLegendDefinition {
        boxWidth: number;
        fontSize?: number;
        fontFamily?: Color;
        fontColor?: Color;
        fontStyle?: string;
        padding?: number;
        generateLabels?: Function;
        usingPointStyle?: boolean;
    }


    export interface Title {
        display?: boolean;
        text?: string;
        position?: string; // Default 'top'
        fullWidth?: boolean;
        fontSize?: number;
        fontFamily?: Color;
        fontColor?: Color;
        fontStyle?: string;
        padding?: number;
    }

    export interface AxisDefinitionY {
        ticks?: TickDefinition;
        type?: "linear" | "time" | string; // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display?: boolean;
        position?: 'left' | 'right' | 'top' | 'bottom';
        id?: string;
        gridLines?: AxisGridLines;
        scaleLabel?: AxisScaleLabels;
        stacked?: boolean; //If true, bars are stacked on the axis
    }


    export interface AxisDefinitionX extends AxisDefinitionY {
        time?: TimeDefinition; //only for x-axis!
    }



    export interface TimeDefinition {
        displayFormats?: TimeDisplayFormat;
        isoWeekday?: boolean; //If true and the unit is set to 'week', iso weekdays will be used.
        //  min?: Time;
        // max?: Time;
        parser?: string | Function;
        round?: string;
        tooltipFormat?: string;
        unit?: string
        unitStepSize?: number;
    }

    export interface TimeDisplayFormat {
        millisecond?: string;
        second?: string;
        minute?: string;
        hour?: string;
        day?: string;
        week?: string;
        month?: string;
        quarter?: string;
        year?: string;
    }


    export interface AxisScaleLabels {
        display?: boolean;
        labelString?: string; // The text for the title. (i.e. "# of People", "Response Choices")
        fontColor?: Color; //Font color for the scale title - Defaut: #666  
        fontFamily?: string;
        fontSize?: number;
        fontStyle?: string;

    }


    export interface AxisGridLines {
        display?: boolean;
        color?: Color | Array<Color>;
        lineWidth?: number | Array<number>;
        drawBorder?: boolean; //If true draw border on the edge of the chart
        drawOnChartArea?: boolean;
        drawTicks?: boolean; //If true, draw lines beside the ticks in the axis area beside the chart
        tickMarkLength?: number; //Length in pixels that the grid lines will draw into the axis area
        zeroLineWidth?: number; //Stroke width of the grid line for the first index (index 0)
        zeroLineColor?: Color; //Stroke color of the grid line for the first index (index 0)
        offsetGridLines?: boolean; //If true, labels are shifted to be between grid lines. This is used in the bar chart
    }

    export interface TickDefinition {
        beginAtZero?: boolean;
        min?: number; //User defined minimum number for the scale, overrides minimum value from data.
        max?: number;
        maxTicksLimit?: number; //Maximum number of ticks and gridlines to show. If not defined, it will limit to 11 ticks but will show all gridlines - Default: 11
        autoSkip?: boolean;
        display?: boolean;
        callback?: Function; //Returns the string representation of the tick value as it should be displayed on the chart.
        fontColor?: Color;
        fontFamily?: string;
        fontSize?: number;
        fontStyle?: string;
        labelOffset?: number;
        maxRotation?: number;
        minRotation?: number;
        mirror?: boolean;
        padding?: number; //Padding between the tick label and the axis. Note: Only applicable to horizontal scales.
        rverese?: boolean; //Reverses order of tick labels.
        fixedStepSize?: number; //User defined fixed step size for the scale. If set, the scale ticks will be enumerated by multiple of stepSize, having one tick per increment. If not set, the ticks are labeled automatically using the nice numbers algorithm.
        stepSize?: number; //if defined, it can be used along with the min and the max to give a custom number of steps. See the example below.
        suggestedMin?: number;
        suggestedMax?: number;//User defined maximum number for the scale, overrides maximum value except for if it is lower than the maximum value

    }

    export interface OptionElement {
        rectangle?: OptionElementRectangle;
        point?: OptionElementPoint;
        line?: OptionElementLine;
        arc?: OptionElementArc;
    }

    export interface OptionElementRectangle {
        backgroundColor?: Color;
        borderWidth?: number;
        borderColor?: string,
        borderSkipped?: 'left' | 'right' | 'top' | 'bottom';
    }

    export interface OptionElementPoint {
        radius?: number;
        pointStyle?: string;
        backgroundColor?: Color;
        borderWidth?: number;
        borderColor?: Color;
        hitRadius?: number;
        hoverRadius?: number;
        hoverBorderWidth?: number;
    }

    export interface OptionElementLine {
        tension?: number;
        backgroundColor?: Color;
        borderWidth?: number;
        borderColor?: Color;
        borderCapStyle?: string;
        borderDash?: Array<number>;
        borderDashOffset?: number;
        borderJoinStyle: string;
        capBezierPoints: boolean;
        fill?: boolean;
        stepped?: boolean;
    }

    export interface OptionElementArc {
        backgroundColor: Color;
        borderColor?: Color;
        borderWidth?: number;
    }

    export class Color {
    }

    export class Image {

    }

}