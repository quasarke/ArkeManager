import { ActionReducerMap, MetaReducer } from '@ngrx/store';

import { environment } from '../../../environments/environment';
import { storeFreeze } from 'ngrx-store-freeze';
import * as go from "gojs";
import { diagramReducer } from './diagram/diagram.reducer';
import { paletteReducer } from './palette/palette.reducer';
export interface appState {
    diagram: go.Diagram
    palette: go.Palette

}


export const appReducer: ActionReducerMap<appState> = {

  diagram:  diagramReducer,
  palette: paletteReducer


}

export const metaReducers: MetaReducer<appState>[] = !environment.production ? [storeFreeze] : [];
