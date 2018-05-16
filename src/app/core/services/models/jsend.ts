import { Observable } from 'rxjs';
export class Jsend {
  status = '';
  data: any = {};
  message = '';

  constructor(json?: Partial<Jsend>) {
    if (json) {
      Object.assign(this, json);
    }
  }

  public jsendValidate(this): boolean {
   if (["success"].includes(this.status.toLowerCase())) {
     return true;
   }
   return false;
  }
}
