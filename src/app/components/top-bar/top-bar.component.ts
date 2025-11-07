import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,            // add if this component is standalone in your project
  imports: [CommonModule],     // needed for *ngIf
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() sidebarOpen = false;
  unreadCount: number = 0; // This would typically be fetched from a service

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName = `${user.firstName} ${user.lastName}`;
    }
    this.unreadCount = 5; // Example static value; replace with real data fetching logic
  }

  onToggle() {
    this.toggleSidebar.emit();
  }

  userName = '';


}