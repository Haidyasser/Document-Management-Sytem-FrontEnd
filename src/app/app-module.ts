import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeWorkspaceComponent } from './home-workspace/home-workspace';

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
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
