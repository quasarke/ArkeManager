import { Action } from '@ngrx/store';
import {  ActionWithPayload } from '../../util/action-name-helper';
import * as go from "gojs";
import { diagramActionTypes } from './diagram.actions';

const initalState: go.Diagram = new go.Diagram;

export function diagramReducer(state = initalState, action: ActionWithPayload<go.Diagram>): go.Diagram {
    switch (action.type) {
        case diagramActionTypes.LOAD:
            return action.payload;

        case diagramActionTypes.DELETE:
            return initalState;

        default:
            return state;
    }
}
