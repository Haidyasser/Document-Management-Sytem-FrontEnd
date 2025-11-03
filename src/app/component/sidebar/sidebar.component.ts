import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() open = true;
  @Output() closed = new EventEmitter<void>();

  constructor(private router: Router) {}

  closeSidebar() {
    this.closed.emit();
  }

  logout() {
    localStorage.removeItem('token'); // clear the JWT
    this.router.navigate(['/login']);
  }
}