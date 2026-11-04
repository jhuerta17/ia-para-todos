import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BRAND_NAME } from '../../../i18n/lang';
import { BrandMark } from '../../../shared/brand-mark';
import { Icon } from '../../../shared/icon';

// Branded access shell shared visually with the student portal.
@Component({
  selector: 'app-admin-auth-layout',
  imports: [BrandMark, Icon, RouterModule],
  templateUrl: './admin-auth-layout.html',
})
export class AdminAuthLayout {
  protected readonly brand = BRAND_NAME.en;
}
