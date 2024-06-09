import { LoginComponent } from './account/login/login.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { AuthInterceptor } from './auth/auth.interceptor';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
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
import { ReviewsComponent } from './admin/reviews/reviews.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { RegisterComponent } from './account/register/register.component';
import { UpdateComponent } from './account/update/update.component';
import { MenuAccountComponent } from './layout/menu-account/menu-account.component';
import { ForgotPasswordComponent } from './account/forgot-password/forgot-password.component';
import { CategoryComponent } from './categories/category/category.component';
import { CollectionsComponent } from './categories/collections/collections.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { ProductSearchComponent } from './product-search/product-search.component';
import { CartComponent } from './cart/cart.component';
import { PaymentComponent } from './payment/payment.component';
import { VoucherComponent } from './voucher/voucher.component';
import { ApplyOrderComponent } from './admin/order/apply-order/apply-order.component';
import { OrdersComponent } from './admin/order/orders/orders.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PickAddressComponent } from './admin/product/pick-address/pick-address.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { StatisticsComponent } from './admin/statistics/statistics.component';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';

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
    ReviewsComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    RegisterComponent,
    UpdateComponent,
    MenuAccountComponent,
    ForgotPasswordComponent,
    CategoryComponent,
    CollectionsComponent,
    ProductDetailComponent,
    FavoriteComponent,
    ProductSearchComponent,
    CartComponent,
    PaymentComponent,
    VoucherComponent,
    ApplyOrderComponent,
    OrdersComponent,
    NotFoundComponent,
    PickAddressComponent,
    OrderHistoryComponent,
    StatisticsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    SlickCarouselModule,
    SocialLoginModule
  ],
  providers: [
    JwtHelperService, AuthGuard,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              // '328719094592-1bqsk536ltagnlud3e2r98k840o19sr8.apps.googleusercontent.com'
              '328719094592-7a78pluijme013k9rg7jim5is2dvssq8.apps.googleusercontent.com' // local
            )
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            // provider: new FacebookLoginProvider('489443870278031')
            provider: new FacebookLoginProvider('491304316665072') // local
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
