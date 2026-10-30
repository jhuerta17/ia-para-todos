import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Vendored from TailAdmin (see THIRD_PARTY_NOTICES.md).
@Injectable({ providedIn: 'root' })
export class AdminDropdownService {
  private readonly activeDropdownSubject = new BehaviorSubject<string | null>(null);

  /** ID of the currently open dropdown, or null if none. */
  readonly activeDropdown$: Observable<string | null> = this.activeDropdownSubject.asObservable();

  get activeDropdown(): string | null {
    return this.activeDropdownSubject.value;
  }

  open(id: string): void {
    this.activeDropdownSubject.next(id);
  }

  toggle(id: string): void {
    this.activeDropdownSubject.next(this.activeDropdownSubject.value === id ? null : id);
  }

  close(id?: string): void {
    if (!id || this.activeDropdownSubject.value === id) {
      this.activeDropdownSubject.next(null);
    }
  }

  closeAll(): void {
    this.activeDropdownSubject.next(null);
  }

  isOpen(id: string): boolean {
    return this.activeDropdownSubject.value === id;
  }
}
