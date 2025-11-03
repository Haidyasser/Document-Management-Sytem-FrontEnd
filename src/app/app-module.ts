import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/auth.interceptor';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeWorkspaceComponent } from './components/home-workspace/home-workspace';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { CreateWorkspaceComponent } from './components/create-workspace/create-workspace';
import { WorkspaceDetailsComponent } from './components/workspace-detail/workspace-detail';
import { FolderListComponent } from './components/folder-list/folder-list';
import { FileListComponent } from './components/file-list/file-list';
import { FolderForm } from './components/folder-form/folder-form';
import { FileForm } from './components/file-form/file-form';
import { ConfirmDialog } from './components/shared/confirm-dialog/confirm-dialog';
import { Breadcrumb } from './components/shared/breadcrumb/breadcrumb';

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
    ReactiveFormsModule,
    WorkspaceDetailsComponent,
    FolderListComponent,
    FileListComponent,
    FolderForm,
    FileForm,
    ConfirmDialog,
    Breadcrumb,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }
