import { Action } from '@ngrx/store';
import {  ActionWithPayload } from '../../util/action-name-helper';
import * as go from "gojs";
import { paletteActionTypes } from './palette.actions';

const initalState: go.Palette = new go.Palette;

export function paletteReducer(state = initalState, action: ActionWithPayload<go.Palette>): go.Palette {
    switch (action.type) {
        case paletteActionTypes.LOAD:
            return action.payload;

        case paletteActionTypes.DELETE:
            return initalState;

        default:
            return state;
    }
}
