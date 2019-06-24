import { Injectable } from '@angular/core';
import { NavItem } from './nav.model';

//custom
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';

@Injectable()
export class NavDataService {
    constructor(private http: Http) { }

  public navItems(): Observable<Array<NavItem>> {
    let cacheBuster = "cacheBuster=" + Date.now();
    return this.http.get('/assets/nav-data.static.json?' + cacheBuster).map(res => res.json())
  }
}