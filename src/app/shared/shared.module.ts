import { IconComponent } from './components/icon/icon.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TextMaskModule } from 'angular2-text-mask';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTooltipModule} from '@angular/material/tooltip';
import { ActiveMenuPipe } from './pipe/active-menu.pipe';



@NgModule({
  declarations: [ActiveMenuPipe, IconComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TextMaskModule,
    MatListModule,
    MatSelectModule,
    MatSidenavModule,
    MatExpansionModule,
    MatTooltipModule,
    MatIconModule
  ],
  exports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TextMaskModule,
    MatListModule,
    MatSelectModule,
    MatSidenavModule,
    MatExpansionModule,
    MatTooltipModule,
    MatIconModule,
    ActiveMenuPipe,
    IconComponent
  ]
})
export class SharedModule { }
