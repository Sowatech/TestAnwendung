import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    L10nLoader,
    LocalizationModule,
    ProviderType,
    TRANSLATION_CONFIG,
    TranslationConfig,
    TranslationModule,
} from 'angular-l10n';

import { DebounceDirective } from './debounce.directive';
import { SwtCheckboxWrapper } from './swt-checkbox-wrapper.component';
import { SwtCheckboxComponent } from './swt-checkbox.component';
import { SwtDateIntervalComponent } from './swt-date-interval/swt-date-interval.component';
import { SwtDatePickerComponent } from './swt-date-picker.component';
import { DropDownContainerComponent } from './swt-dropdown-container.component';
import { IBoxComponent } from './swt-ibox.component';
import { SwtLanguageSelectComponent } from './swt-language-selector.component';
import { LoadingIndicatorComponent } from './swt-loading-indicator.component';
import { SwtPopoverComponent } from './swt-popover.component';
import { RatingIconsComponent } from './swt-rating-icons.component';
import { WizardStepComponent } from './swt-wizard/swt-wizard-step.component';
import { WizardComponent } from './swt-wizard/swt-wizard.component';
import { SwtDateInputComponent, } from './swt-date-input';
import { VisibleForRoleComponent } from './visible-for-role.component';
import { VisibleForRoleDirective } from './visible-for-role.directive';
import { TextMaskModule } from 'angular2-text-mask';
import { NoDblClickModule } from '../no-double-click/no-double-click.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslationModule,
        LocalizationModule,
        TextMaskModule,
		NoDblClickModule
    ],
    declarations: [DropDownContainerComponent,
        SwtDatePickerComponent,
        SwtDateInputComponent,
        SwtPopoverComponent,
        SwtDateIntervalComponent,
        RatingIconsComponent,
        LoadingIndicatorComponent,
        IBoxComponent,
        SwtCheckboxWrapper,
        SwtCheckboxComponent,
        
        WizardComponent, WizardStepComponent,
        VisibleForRoleComponent, VisibleForRoleDirective,
        SwtLanguageSelectComponent,
        DebounceDirective
    ],
    exports: [DropDownContainerComponent,
        SwtDatePickerComponent,
        SwtPopoverComponent,
        SwtDateIntervalComponent,
        SwtDateInputComponent,
        RatingIconsComponent,
        LoadingIndicatorComponent,
        IBoxComponent,
        SwtCheckboxWrapper,
        SwtCheckboxComponent,
        WizardComponent, WizardStepComponent,
        VisibleForRoleComponent, VisibleForRoleDirective,
        DebounceDirective,
        SwtLanguageSelectComponent
    ],
    providers: []
})
export class SwtControlsModule {
    constructor(
        public l10nLoader: L10nLoader,
        @Inject(TRANSLATION_CONFIG) private translationConfig: TranslationConfig
    ) {
        this.translationConfig.providers.push(
            { type: ProviderType.Static, prefix: './assets/resources/shared/swt-date-picker-' },
        );
        this.l10nLoader.load();
    }
}
