import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class StateMachineService {

    createStateMachine<TSTATE, TINPUT>(
        initialState: TSTATE,
        transitions: ITransition<TSTATE, TINPUT>[],
        finalStates?: TSTATE[]
    ): StateMachine<TSTATE, TINPUT> {
        let sm = new StateMachine<TSTATE, TINPUT>(initialState, transitions, finalStates);
        return sm;
    }
}

export class StateMachine<TSTATE, TINPUT> {

    constructor(
        private initialState: TSTATE,
        private transitions: ITransition<TSTATE, TINPUT>[],
        private finalStates?: TSTATE[]) {
        this._state = initialState;
    }

    private _state: TSTATE;

    public set currentState(value: TSTATE) {
        if (value != this._state) {
            this._state = value;
            this.onStateChanged.next(this._state);
        }

        if (this.finalStates && this.finalStates.indexOf(value) > 0) {
            this.onFinalState.next(this._state);
        }
    }

    public get currentState(): TSTATE {
        return this._state;
    }

    public onStateChanged = new Subject<TSTATE>();
    public onFinalState = new Subject<TSTATE>();

    public resetState() {
        this._state = this.initialState;
    }

    public sendInput(input: TINPUT) {
        let relevantTransitions = this.transitions.filter((trans) => trans.fromState == this.currentState && trans.input == input);
        if (relevantTransitions.length == 0) {
            //no state change
        }
        if (relevantTransitions.length == 1) {
            this.currentState = relevantTransitions[0].toState;
        }
        if (relevantTransitions.length > 1) {
            //error
            console.error("more than 1 transition");
        }
    }

}

export interface ITransition<TSTATE, TINPUT> {
    fromState: TSTATE;
    toState: TSTATE;
    input: TINPUT;
}