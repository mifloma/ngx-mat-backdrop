import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Document } from '../document-list/document-list.component';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})
export class ItemDetailsComponent {

  @Input() item: Document = null!;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  onClose() {
    this.close.emit();
  }

}
