import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserAuthService } from '../services/auth/user-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private UserAuthService: UserAuthService, private Router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (this.UserAuthService.authenticated()) {
      const role = route.data["role"] as string
      if (role) {
        const checkRole = this.UserAuthService.hasRole(role)
        if (checkRole) {
          return true
        } else {
          // forbidden
          this.Router.navigateByUrl("/")
          return false
        }
      }
      return true
    }

    this.Router.navigateByUrl("/account/login")
    return false;
  }

}
