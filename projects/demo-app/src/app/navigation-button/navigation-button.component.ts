import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Backdrop, FrontLayerRef, FrontLayerState } from 'ngx-mat-backdrop';
import { take } from 'rxjs/operators';

@Component({
  selector: 'arco-navigation-button',
  templateUrl: './navigation-button.component.html',
  styleUrls: ['./navigation-button.component.scss'],
  animations: [
    trigger('rotate', [
      state('closed', style({ transform: 'none' })),
      state('opened', style({ transform: 'rotate(0.75turn)' })),
      transition('closed <=> opened', animate('250ms'))
    ])
  ]
})
export class NavigationButtonComponent implements OnInit {

  @Input()
  type: 'empty' | 'back' | 'menu' = 'empty';
  @Output()
  open: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  close: EventEmitter<void> = new EventEmitter<void>();

  state: 'void' | 'opened' = 'void';

  private _frontLayerRef: FrontLayerRef<any> | undefined;

  constructor(
    private backdrop: Backdrop
  ) { }

  ngOnInit(): void {
    this.backdrop.afterOpened()
      .pipe(take(1))
      .subscribe(() => {
        this._frontLayerRef = this.backdrop.getOpenedFrontLayer();

        this._frontLayerRef?.beforeDroped().subscribe(() => {
          this.state = 'opened';
        });

        this._frontLayerRef?.beforeLift().subscribe(() => {
          this.state = 'void';
        });
      });
  }

  isContextMenuOpened(): boolean {
    if (this._frontLayerRef && this._frontLayerRef.getState() === FrontLayerState.DROPED) {
      return true;
    } else {
      return false;
    }
  }

  onOpen() {
    this.open.emit();
  }

  onClose() {
    this.close.emit();
  }

}
