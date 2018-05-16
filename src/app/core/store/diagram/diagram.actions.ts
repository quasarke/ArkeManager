import { Action } from '@ngrx/store';
import { type, ActionWithPayload } from '../../util/action-name-helper';
import { Injectable } from '@angular/core';
import * as go from "gojs";


export const diagramActionTypes = {
    LOAD: type('[diagram] Load'),
    DELETE: type('[diagram] Delete')
};

@Injectable()
export class diagramActions {
    public delete(): Action {
        return {
            type: diagramActionTypes.LOAD,
        };
    }
    public load(payload: go.Diagram): ActionWithPayload<go.Diagram> {
        return {
            type: diagramActionTypes.LOAD,
            payload
        };
    }
}
