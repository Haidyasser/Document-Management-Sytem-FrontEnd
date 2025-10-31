import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { HomeWorkspaceComponent } from './component/home-workspace/home-workspace';
import { CreateWorkspaceComponent } from './component/create-workspace/create-workspace';

const routes: Routes = [
  { path: '', component: HomeWorkspaceComponent },        // home after login
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'create-workspace', component: CreateWorkspaceComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
