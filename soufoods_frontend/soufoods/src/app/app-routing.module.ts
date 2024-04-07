import { OrdersComponent } from './admin/orders/orders.component';
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

const routes: Routes = [
  {path: "account/login", component: LoginComponent},
  {path: 'admin', canActivate: [AuthGuard], data: {role: 'admin'},
    children: [
      {path: "dashboard", component: DashboardComponent},
      {path: "users", component: UsersComponent},
      {path: "add-category", component: AddCategoryComponent},
      {path: "categories", component: CategoriesComponent},
      {path: "add-product", component: AddProductComponent},
      {path: "products", component: ProductsComponent},
      {path: "add-voucher", component: AddVoucherComponent},
      {path: "vouchers", component: VouchersComponent},
      {path: "orders", component: OrdersComponent},
      {path: "reviews", component: ReviewsComponent},
    ]
  },
  //{path: 'user', component: UserComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
