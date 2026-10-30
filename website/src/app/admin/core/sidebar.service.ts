import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Vendored from TailAdmin (see THIRD_PARTY_NOTICES.md).
@Injectable({ providedIn: 'root' })
export class AdminSidebarService {
  private readonly isExpandedSubject = new BehaviorSubject<boolean>(true);
  private readonly isMobileOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly isHoveredSubject = new BehaviorSubject<boolean>(false);

  readonly isExpanded$ = this.isExpandedSubject.asObservable();
  readonly isMobileOpen$ = this.isMobileOpenSubject.asObservable();
  readonly isHovered$ = this.isHoveredSubject.asObservable();

  setExpanded(value: boolean): void {
    this.isExpandedSubject.next(value);
  }

  toggleExpanded(): void {
    this.isExpandedSubject.next(!this.isExpandedSubject.value);
  }

  setMobileOpen(value: boolean): void {
    this.isMobileOpenSubject.next(value);
  }

  toggleMobileOpen(): void {
    this.isMobileOpenSubject.next(!this.isMobileOpenSubject.value);
  }

  setHovered(value: boolean): void {
    this.isHoveredSubject.next(value);
  }
}
