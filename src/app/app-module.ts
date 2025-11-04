import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './core/auth.interceptor';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeWorkspaceComponent } from './components/home-workspace/home-workspace';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { CreateWorkspaceComponent } from './components/create-workspace/create-workspace';
import { WorkspaceDetailComponent } from './components/workspace-detail/workspace-detail';
import { FolderListComponent } from './components/folder-list/folder-list';
import { FileListComponent } from './components/file-list/file-list';
import { ConfirmDialog } from './components/shared/confirm-dialog/confirm-dialog';
import { Breadcrumb } from './components/shared/breadcrumb/breadcrumb';
import { FolderDialogComponent } from './components/folder-dialog/folder-dialog';
import { FileDialogComponent } from './components/file-dialog/file-dialog';
import { L } from '@angular/cdk/keycodes';

@NgModule({
  declarations: [
    App,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    LoginComponent,
    RegisterComponent,
    HomeWorkspaceComponent,
    SidebarComponent,
    TopBarComponent,
    CreateWorkspaceComponent,
    WorkspaceDetailComponent,
    FolderListComponent,
    FileListComponent,
    ConfirmDialog,
    Breadcrumb,
    FolderDialogComponent,
    FileDialogComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }
