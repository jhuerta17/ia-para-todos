import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminDropdownService } from '../../core/dropdown.service';
import { DemoState } from '../../data/demo-state';
import { AdminSession } from '../../session/admin-session';

// Slimmed from TailAdmin's UserDropdown (see THIRD_PARTY_NOTICES.md):
// account info plus real actions only (view site, sign out).
// Language/RTL switching, profile, and support links removed.
@Component({
  selector: 'app-admin-user-dropdown',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-user-dropdown.html',
})
export class AdminUserDropdown implements OnInit, OnDestroy {
  private readonly element = inject(ElementRef);
  private readonly dropdowns = inject(AdminDropdownService);
  private readonly session = inject(AdminSession);
  protected readonly demo = inject(DemoState);
  private readonly sub = new Subscription();

  protected readonly dropdownId = 'admin-user-dropdown';
  protected isOpen = false;
  protected readonly user = this.session.user;
  protected readonly initial = computed(() => (this.user()?.name ?? 'A').trim().charAt(0).toUpperCase() || 'A');

  ngOnInit(): void {
    this.sub.add(
      this.dropdowns.activeDropdown$.subscribe((activeId) => {
        this.isOpen = activeId === this.dropdownId;
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleDropdown(event?: Event): void {
    event?.stopPropagation();
    this.dropdowns.toggle(this.dropdownId);
  }

  closeDropdown(): void {
    this.dropdowns.close(this.dropdownId);
  }

  signOut(): void {
    this.closeDropdown();
    this.session.signOut();
  }

  toggleDemo(): void {
    this.closeDropdown();
    this.demo.toggle();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.element.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
