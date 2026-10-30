import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

// Adapted from TailAdmin's PageBreadcrumb (see THIRD_PARTY_NOTICES.md):
// renders the page h1 and trails back to the admin overview.
@Component({
  selector: 'app-admin-breadcrumb',
  imports: [RouterModule],
  host: { class: 'block' },
  templateUrl: './admin-breadcrumb.html',
})
export class AdminBreadcrumb {
  @Input() pageTitle = '';
}
