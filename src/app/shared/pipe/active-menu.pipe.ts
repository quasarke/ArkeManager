import { ActivatedRoute } from '@angular/router';
import { Pipe, PipeTransform } from '@angular/core';
import { MenuOption } from 'src/app/models/menu';


/**
 * this is for the menu to be able to tell if a certain route is active and the sub panel should be expanded
 */
@Pipe({
  name: 'activeMenu',
  pure: false
})
export class ActiveMenuPipe implements PipeTransform {
  constructor(private activatedRoute: ActivatedRoute) {}
  transform(subRoutes: MenuOption[]): boolean {
      return subRoutes.map(s => s.route ? s.route : '')
      .some( r =>  r.includes('/' + this.activatedRoute.snapshot.firstChild.url[0].path));
  }

}
