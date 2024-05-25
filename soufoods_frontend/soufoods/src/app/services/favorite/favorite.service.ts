import { UserAuthService } from './../auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public findByProduct(id: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/favorites/findByProduct/${id}`)
  }

  public findAll(pageNumber: number, token: string) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/favorites?pageNumber=${pageNumber}&token=${token}`)
  }

  public findAllByToken(token: string) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/favorites/all?token=${token}`)
  }

  public checkFavoriteBeforeLogin(favorite : any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/favorites`, favorite)
  }

  public likeAndUnlike(favorite: {}) {
    return this.httpClient.put(`${this.userAuthService.getHost()}/api/favorites`, favorite)
  }
}
