import { HttpClient } from '@angular/common/http';
import { UserAuthService } from './../auth/user-auth.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HomeServiceService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }
}
