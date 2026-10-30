import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Vendored from TailAdmin (see THIRD_PARTY_NOTICES.md).
@Pipe({ name: 'safeHtml' })
export class AdminSafeHtmlPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
