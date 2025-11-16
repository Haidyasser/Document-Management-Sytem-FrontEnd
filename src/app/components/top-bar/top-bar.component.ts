import { Component, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() newFile = new EventEmitter<void>();
  @Output() newFolder = new EventEmitter<void>();
  @Output() searchQueryChange = new EventEmitter<string>();
  @Input() sidebarOpen = false;
  searchQuery = '';
  firstName = 'Admin';
  showNewButton = false;
  showNewMenu = false;

  constructor(private authService: AuthService, private router: Router) {
    const user = this.authService.getUser();
    if (user && typeof user.firstName === 'string' && user.firstName.trim()) {
      this.firstName = user.firstName.trim();
    }

    const update = (url: string) => {
      this.showNewButton = /\/workspaces\//.test(url) || /\/folders\//.test(url);
    };
    update(this.router.url);
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => update(e.urlAfterRedirects || (e as any).url));
  }

  onToggle() {
    this.toggleSidebar.emit();
  }

  toggleNewMenu() {
    this.showNewMenu = !this.showNewMenu;
  }

  onSelectNew(type: 'file' | 'folder') {
    this.showNewMenu = false;
    if (type === 'file') this.newFile.emit();
    else this.newFolder.emit();
  }

  @HostListener('document:click')
  closeOnOutsideClick() {
    if (this.showNewMenu) this.showNewMenu = false;
  }

  onSearchChange() {
    this.searchQueryChange.emit(this.searchQuery);
  }
}
