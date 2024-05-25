import { PickAddressComponent } from './admin/product/pick-address/pick-address.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ApplyOrderComponent } from './admin/order/apply-order/apply-order.component';
import { PaymentComponent } from './payment/payment.component';
import { CartComponent } from './cart/cart.component';
import { ProductSearchComponent } from './product-search/product-search.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CollectionsComponent } from './categories/collections/collections.component';
import { CategoryComponent } from './categories/category/category.component';
import { ForgotPasswordComponent } from './account/forgot-password/forgot-password.component';
import { UpdateComponent } from './account/update/update.component';
import { RegisterComponent } from './account/register/register.component';
import { HomeComponent } from './home/home.component';
import { ReviewsComponent } from './admin/reviews/reviews.component';
import { VouchersComponent } from './admin/voucher/vouchers/vouchers.component';
import { AddVoucherComponent } from './admin/voucher/add-voucher/add-voucher.component';
import { ProductsComponent } from './admin/product/products/products.component';
import { AddProductComponent } from './admin/product/add-product/add-product.component';
import { CategoriesComponent } from './admin/category/categories/categories.component';
import { AddCategoryComponent } from './admin/category/add-category/add-category.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './account/login/login.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { UsersComponent } from './admin/users/users.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VoucherComponent } from './voucher/voucher.component';
import { OrdersComponent } from './admin/order/orders/orders.component';

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "account", component: UpdateComponent, canActivate: [AuthGuard] },
  { path: "account/forgot-password", component: ForgotPasswordComponent },
  { path: "account/reset/:id/:validCode", component: ForgotPasswordComponent },
  { path: "account/login", component: LoginComponent },
  { path: "account/register", component: RegisterComponent },
  { path: "search", component: ProductSearchComponent },
  { path: "cart", component: CartComponent },
  { path: "payment", component: PaymentComponent },
  { path: "favorites", component: FavoriteComponent },
  { path: "vouchers", component: VoucherComponent, canActivate: [AuthGuard] },
  { path: "collections", component: CollectionsComponent },
  { path: "collections/category", component: CategoryComponent },
  { path: "collections/product", component: ProductDetailComponent },
  {
    path: 'admin', canActivate: [AuthGuard], data: { role: 'admin' },
    children: [
      { path: "dashboard", component: DashboardComponent },
      { path: "users", component: UsersComponent },
      { path: "add-category", component: AddCategoryComponent },
      { path: "categories", component: CategoriesComponent },
      { path: "add-product", component: AddProductComponent },
      { path: "products", component: ProductsComponent },
      { path: "pick-address", component: PickAddressComponent },
      { path: "add-voucher", component: AddVoucherComponent },
      { path: "vouchers", component: VouchersComponent },
      { path: "apply-order", component: ApplyOrderComponent },
      { path: "orders", component: OrdersComponent },
      { path: "reviews", component: ReviewsComponent },
    ]
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
