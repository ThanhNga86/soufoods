import { JwtHelperService } from '@auth0/angular-jwt';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { UserAuthService } from '../services/auth/user-auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private userAuthService: UserAuthService, private jwtHepler:JwtHelperService, private Router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.get("No-Auth") === "True") {
      return next.handle(req.clone())
    }
    if (this.userAuthService.getRefreshToken() && !(this.jwtHepler.isTokenExpired(this.userAuthService.getRefreshToken()))) {
      const tokenRefresh = this.userAuthService.getRefreshToken()
      req = this.addToken(req, tokenRefresh)
    } else {
      const token = this.userAuthService.getToken()
      req = this.addToken(req, token)
    }

    return next.handle(req).pipe(
      catchError(
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Router.navigateByUrl("/account/login")
          }
          return throwError("error")
        }
      )
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone(
      {
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
}
