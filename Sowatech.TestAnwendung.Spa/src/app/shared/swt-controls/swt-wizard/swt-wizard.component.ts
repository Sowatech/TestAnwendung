import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { WizardStep, WizardStepComponent } from './swt-wizard-step.component';

@Component({
  selector: 'swt-wizard',
  templateUrl: './swt-wizard.component.html'
})

//concepts for ViewChild,ViewChildren,ContentChild,ContentChildren see http://blog.mgechev.com/2016/01/23/angular2-viewchildren-contentchildren-difference-viewproviders/
export class WizardComponent implements OnInit, OnDestroy, AfterContentInit {
  constructor() { }

  private subscriptions = new Array<Subscription>();
  ngOnInit() { this.subscriptions.push(); }

  @ContentChildren(WizardStepComponent) wizardStepComponents: QueryList<WizardStepComponent>;
  ngAfterContentInit() {
    for (let wizardStepComponent of this.wizardStepComponents.toArray()) {
      this.steps.push(wizardStepComponent.step);
    }
    this.initSteps();
  }

  ngOnDestroy() {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
  }

  @Input() tabclass: string = "col-lg-3";
  @Input() autoReset: boolean = true;

  @Output() onAfterReset = new EventEmitter<void>();
  @Output() onBeforeLeaveStepToNext = new EventEmitter<WizardStep>();
  @Output() onBeforeLeaveStepToPrevious = new EventEmitter<WizardStep>();
  @Output() onAfterLeaveStep = new EventEmitter<WizardStep>();
  @Output() onBeforeEnterStep = new EventEmitter<WizardStep>();
  @Output() onAfterEnterStep = new EventEmitter<WizardStep>();
  @Output() onStepChanged = new EventEmitter<WizardStep>();
  @Output() onBeforeFinished = new EventEmitter<WizardStep>();
  @Output() onAfterFinished = new EventEmitter<WizardStep>();
  @Output() onCanceled = new EventEmitter<void>();

  steps: Array<WizardStep> = [];

  private initSteps() {
    this.setStepDefaults();
    this.reset();
  }

  private setStepDefaults() {
    if (this.steps.length > 0 && !this.steps.find(s => s.first)) {
      this.setFirstStep(this.steps[0]);
    }
    if (this.steps.length > 0 && !this.steps.find(s => s.last)) {
      this.setLastSteps([this.steps[this.steps.length - 1]]);
    }
    if (this.steps.length > 0 && !this.steps.find(s => s.canFinish)) {
      for (let s of this.steps.filter(sx => sx.last)) {
        s.canFinish = true;
      }
    }
  }

  public reset() {
    for (var s of this.steps) {
      s.done = false;
      s.disabled = true;
    }
    let firstStep = this.steps.find(s => s.first);
    this.setCurrentStep(firstStep);

    this.setStepDefaults();

    this.onAfterReset.emit();
	this.onAfterEnterStep.emit(firstStep);
  }

  private setFirstStep(firstStep: WizardStep) {
    for (var s of this.steps) {
      s.first = (s != firstStep) ? false : true;
    }
  }

  public set firstStep(firstStep: WizardStep) {
    this.setFirstStep(firstStep);
  }

  public get firstStep(): WizardStep {
    return this.steps.find(s => s.first);
  }

  private setCurrentStep(currentStep: WizardStep) {
    for (var s of this.steps) {
      s.current = (s != currentStep) ? false : true;
    }
    currentStep.disabled = false;
    currentStep.done = false;
  }

  set currentStep(currentStep: WizardStep) {
    this.setCurrentStep(currentStep);
    this.onStepChanged.emit(currentStep);
  }

  get currentStep(): WizardStep {
    return this.steps.find(s => s.current);
  }

  public setLastSteps(lastSteps: WizardStep[]) {
    for (var s of this.steps) {
      s.last = (lastSteps.indexOf(s) < 0) ? false : true;
    }
  }

  getNextStep(): WizardStep {
    let result = null;
    if (this.currentStep && !this.currentStep.last) {
      let indexOfCurrent = this.steps.indexOf(this.currentStep);
      let indexOfNext = indexOfCurrent + 1;
      if (this.steps.length > indexOfNext) {
        result = this.steps[indexOfNext];
      }
    }
    return result;
  }

  getPreviousStep(): WizardStep {
    let result = null;
    if (this.currentStep && !this.currentStep.first) {
      let indexOfCurrent = this.steps.indexOf(this.currentStep);
      let indexOfPrev = indexOfCurrent - 1;
      if (indexOfPrev >= 0) {
        result = this.steps[indexOfPrev];
      }
    }
    return result;
  }

  goto(gotoStep: WizardStep) {
    if (!gotoStep.disabled) {
      let indexOfGotoStep = this.steps.indexOf(gotoStep);
      let indexOfCurrent = this.steps.indexOf(this.currentStep);

      if (indexOfGotoStep > indexOfCurrent) {
        this.next(gotoStep);
      }
      else {
        this.previous(gotoStep);
      }
    }

  }

  next(enteredStep?: WizardStep) {
    this.onBeforeLeaveStepToNext.emit(this.currentStep);
    if (this.currentStep.canLeaveToNext) {
      if (!enteredStep) enteredStep = this.getNextStep();
      this.enterStep(enteredStep);
    }
  }

  previous(enteredStep?: WizardStep) {
    this.onBeforeLeaveStepToPrevious.emit(this.currentStep);
    if (this.currentStep.canLeaveToPrevious) {
      if (!enteredStep) enteredStep = this.getPreviousStep();
      this.enterStep(enteredStep);
    }
  }

  private leftStep(leftStep: WizardStep) {
    leftStep.done = true;
    this.onAfterLeaveStep.emit(leftStep);
  }

  private enterStep(enteredStep: WizardStep) {
    this.onBeforeEnterStep.emit(enteredStep);
    let lastStep = this.currentStep;
    this.currentStep = enteredStep;
    this.leftStep(lastStep);
    this.onAfterEnterStep.emit(this.currentStep);
  }

  finish() {
    this.onBeforeFinished.emit(this.currentStep);
    if (this.currentStep.canFinish) {
      this.onAfterFinished.emit(this.currentStep);
      if(this.autoReset) this.reset();
    }
  }

  cancel() {
    this.onCanceled.emit();
    if(this.autoReset) this.reset();
  }
}
