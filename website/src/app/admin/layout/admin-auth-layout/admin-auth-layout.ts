import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrandMark } from '../../../shared/brand-mark';

// Adapted from TailAdmin's AuthPageLayout (see THIRD_PARTY_NOTICES.md):
// split-screen access layout with the site brand; decorative grid
// and theme toggle removed (light-only admin).
@Component({
  selector: 'app-admin-auth-layout',
  imports: [BrandMark, RouterModule],
  templateUrl: './admin-auth-layout.html',
})
export class AdminAuthLayout {}
