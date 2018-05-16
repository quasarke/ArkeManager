import { Action } from '@ngrx/store';
import { type, ActionWithPayload } from '../../util/action-name-helper';
import { Injectable } from '@angular/core';
import * as go from "gojs";


export const paletteActionTypes = {
    LOAD: type('[palette] Load'),
    DELETE: type('[palette] Delete')
};

@Injectable()
export class paletteActions {
    public delete(): Action {
        return {
            type: paletteActionTypes.LOAD,
        };
    }
    public load(payload: go.Palette): ActionWithPayload<go.Palette> {
        return {
            type: paletteActionTypes.LOAD,
            payload
        };
    }
}
