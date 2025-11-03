import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeWorkspaceComponent } from './components/home-workspace/home-workspace';
import { CreateWorkspaceComponent } from './components/create-workspace/create-workspace';
import { authGuard } from './guards/auth.guard';
import { WorkspaceDetailsComponent } from './components/workspace-detail/workspace-detail';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: HomeWorkspaceComponent, canActivate: [authGuard] },
  { path: 'create-workspace', component: CreateWorkspaceComponent, canActivate: [authGuard] },
  { path: 'workspaces/:id', component: WorkspaceDetailsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
