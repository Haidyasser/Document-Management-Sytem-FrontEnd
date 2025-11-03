import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  onToggle() {
    this.toggleSidebar.emit();
  }
}