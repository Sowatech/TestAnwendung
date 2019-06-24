import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocalizationModule, TranslationModule } from 'angular-l10n';

import { SwtControlsModule } from '../swt-controls/swt-controls.module';
import { SchedulerMonthSelectorComponent } from './date-selectors/scheduler-month-selector.component';
import { SchedulerWeekSelectorComponent } from './date-selectors/scheduler-week-selector.component';
import { SchedulerCalendarComponent } from './scheduler-calendar.component';
import { SchedulerTimelineComponent } from './scheduler-timeline.component';

@NgModule({
    imports: [
        CommonModule,
        TranslationModule,
        LocalizationModule,
      FormsModule,
      SwtControlsModule//loadingIndicator
    ],
    declarations: [
      SchedulerTimelineComponent,
      SchedulerCalendarComponent,
      SchedulerMonthSelectorComponent, SchedulerWeekSelectorComponent,
      
    ],
    exports: [  
      SchedulerTimelineComponent,SchedulerCalendarComponent,
      SchedulerMonthSelectorComponent, SchedulerWeekSelectorComponent
    ]
})
export class SchedulerModule {
    // constructor(
    //     public l10nLoader: L10nLoader,
    //     @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    // ) {
    //     this.translationConfig.providers.push(
    //         { type: ProviderType.Static, prefix: './assets/resources/shared/scheduler-timeline-' },
    //     );
    //     this.l10nLoader.load();
    // }
}
