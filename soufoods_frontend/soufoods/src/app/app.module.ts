import { LoginComponent } from './account/login/login.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { AuthInterceptor } from './auth/auth.interceptor';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './admin/layout/menu/menu.component';
import { UsersComponent } from './admin/users/users.component';
import { AddCategoryComponent } from './admin/category/add-category/add-category.component';
import { CategoriesComponent } from './admin/category/categories/categories.component';
import { AddProductComponent } from './admin/product/add-product/add-product.component';
import { ProductsComponent } from './admin/product/products/products.component';
import { VouchersComponent } from './admin/voucher/vouchers/vouchers.component';
import { AddVoucherComponent } from './admin/voucher/add-voucher/add-voucher.component';
import { OrdersComponent } from './admin/orders/orders.component';
import { ReviewsComponent } from './admin/reviews/reviews.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './layout/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    MenuComponent,
    UsersComponent,
    LoginComponent,
    AddCategoryComponent,
    CategoriesComponent,
    AddProductComponent,
    ProductsComponent,
    VouchersComponent,
    AddVoucherComponent,
    OrdersComponent,
    ReviewsComponent,
    HomeComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule
  ],
  providers: [JwtHelperService, AuthGuard,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
