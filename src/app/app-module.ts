import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/auth.interceptor';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { HomeWorkspaceComponent } from './component/home-workspace/home-workspace';
import { SidebarComponent } from './component/sidebar/sidebar.component';
import { TopBarComponent } from './component/top-bar/top-bar.component';
import { CreateWorkspaceComponent } from './component/create-workspace/create-workspace';

@NgModule({
  declarations: [
    App,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    LoginComponent,
    RegisterComponent,
    HomeWorkspaceComponent,
    SidebarComponent,
    TopBarComponent,
    CreateWorkspaceComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }
