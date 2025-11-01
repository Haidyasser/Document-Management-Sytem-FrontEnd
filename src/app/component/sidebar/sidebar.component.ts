import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() open = true;
  @Output() closed = new EventEmitter<void>();

  closeSidebar() {
    this.closed.emit();
  }
}