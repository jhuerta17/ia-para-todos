import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { resources } from '../../data/resources';
import { ActionLink } from '../action-link';
import { Icon } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
@Component({selector: 'app-resource-section', imports: [RouterLink, ActionLink, Icon, RevealOnEnter], templateUrl: './resource-section.html', styleUrl: './resource-section.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class ResourceSection { protected readonly resources = resources; }
