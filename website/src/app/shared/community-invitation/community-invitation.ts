import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionLink } from '../action-link';

@Component({
  selector: 'app-community-invitation',
  imports: [ActionLink],
  templateUrl: './community-invitation.html',
  styleUrl: './community-invitation.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityInvitation {
  protected readonly photographs = [
    'peer-support', 'community-group', 'everyday-phone', 'community-learning',
    'collaboration', 'family-learning', 'family-phone', 'accessible-technology',
  ];
}
