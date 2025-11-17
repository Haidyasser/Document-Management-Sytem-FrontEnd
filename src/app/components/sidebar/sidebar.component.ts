import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule]
})
export class SidebarComponent {
  @Input() open = true;
  @Output() closed = new EventEmitter<void>();
  activeRoute = 'my-workspaces';

  constructor(private router: Router, private authService: AuthService) {
    // Update active route based on current URL
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.url;
        if (url.includes('recent')) this.activeRoute = 'recent';
        else if (url.includes('shared')) this.activeRoute = 'shared';
        else if (url.includes('favorite')) this.activeRoute = 'favorite';
        else if (url.includes('deleted')) this.activeRoute = 'deleted';
        else if (url.includes('users')) this.activeRoute = 'users';
        else if (url.includes('account')) this.activeRoute = 'account';
        else this.activeRoute = 'my-workspaces';
      });
  }

  closeSidebar() {
    this.closed.emit();
  }

  navigateTo(route: string) {
    this.activeRoute = route;
    if (route === 'my-workspaces') {
      this.router.navigate(['/']);
    } else if (route === 'recent') {
      this.router.navigate(['/recent']);
    } else if (route === 'shared') {
      // Navigate to shared files when implemented
      this.router.navigate(['/shared']);
    } else if (route === 'favorite') {
      // Navigate to favorite files when implemented
      this.router.navigate(['/favorite']);
    } else if (route === 'deleted') {
      // Navigate to deleted files when implemented
      this.router.navigate(['/deleted']);
    } else if (route === 'users') {
      // Navigate to users management when implemented
      this.router.navigate(['/users']);
    } else if (route === 'account') {
      // Navigate to account when implemented
      this.router.navigate(['/account']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
