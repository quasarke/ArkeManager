import { TemplateRef } from '@angular/core';

export class MenuOption {
  name = '';
  route: any = {};
  subroutes?: Array<MenuOption> = [];
  icon = '';
  function?: (...args) => any;
  specialTemplate?: TemplateRef<any> = null;

  constructor(json?: Partial<MenuOption>) {
    if (json) {
      Object.assign(this, json);
    }
  }
}

