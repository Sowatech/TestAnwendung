import * as moment from 'moment';

export type TIntervalSelectType = number | "lastmonth" | "lastyear" | "lastquarter" | "day" | "currentday" | "currentmonth" | "currentquarter" | "currentyear" | "interval";

export class DateInterval {
    constructor(start?: string | Date, end?: string | Date) {
        this.setStart(start);
        this.setEnd(end);
    }

    public start: string;
    public end: string;

    public get startMoment(): moment.Moment {
        return moment(this.start);
    }

    public get endMoment(): moment.Moment {
        return moment(this.end);
    }

    public get startDate(): Date {
        return moment(this.start).toDate();
    }

    public get endDate(): Date {
        return moment(this.end).toDate();
    }

    public setStart(d: string | Date);
    public setStart(m: moment.Moment);
    public setStart(value: any) {
        this.start = moment(value).format("YYYY-MM-DD");
    }

    public setEnd(d: string | Date);
    public setEnd(m: moment.Moment);
    public setEnd(value: any) {
        this.end = moment(value).format("YYYY-MM-DD");
    }
}

