import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { DiagramEditorComponent } from "./diagram-editor/diagram-editor.component";

import { DynamicFormsCoreModule } from "@ng-dynamic-forms/core";
import { DynamicFormsMaterialUIModule } from "@ng-dynamic-forms/ui-material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import {MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule } from "@angular/material";
import { CountdownComponent } from './components/countdown/countdown.component';
import { DiagramService } from './core/services/diagram.service';
import { appReducer, metaReducers } from "./core/store/app.store";

@NgModule({
  declarations: [
    AppComponent,
    DiagramEditorComponent,
    CountdownComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicFormsCoreModule.forRoot(),
    DynamicFormsMaterialUIModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [DiagramService],
  bootstrap: [AppComponent]
})
export class AppModule { }
