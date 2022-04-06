import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { take } from 'rxjs';
import { Backdrop } from './backdrop';
import { BackdropAnimations } from './backdrop-animations';
import { FrontLayerRef, FrontLayerState } from './front-layer-ref';


@Component({
  selector: 'button[mat-backdrop-open]',
  templateUrl: './backdrop-button.html',
  animations: [BackdropAnimations.backdropButton],
  host: {
    'class': 'mat-backdrop-button',
    '(click)': '_onClick()'
  }
})
export class MatBackdropButton implements OnInit {

  @Input() size: string = '200px';
  @Input() maxSize: boolean = false;

  @Output() open: EventEmitter<void> = new EventEmitter<void>();
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  _state: 'void' | 'opened' = 'void';

  private _frontLayerRef: FrontLayerRef<any> | undefined;

  constructor(
    private _backdrop: Backdrop
  ) { }

  ngOnInit(): void {
    this._backdrop.afterOpened()
      .pipe(take(1))
      .subscribe(() => {
        this._frontLayerRef = this._backdrop.getOpenedFrontLayer();

        this._frontLayerRef?.beforeDroped().subscribe(() => {
          this._state = 'opened';
        });

        this._frontLayerRef?.afterDroped().subscribe(() => {
          this.open.emit();
        });

        this._frontLayerRef?.beforeLift().subscribe(() => {
          this._state = 'void';
        });

        this._frontLayerRef?.afterLift().subscribe(() => {
          this.close.emit();
        });

        if (this.maxSize) {
          this.size = 'calc(100vh - 56px)';
        }
      });
  }

  _opened(): boolean {
    if (this._frontLayerRef && this._frontLayerRef.getState() === FrontLayerState.DROPED) {
      return true;
    } else {
      return false;
    }
  }

  _onClick(): void {
    if (this._state === 'void') {
      this._frontLayerRef?.drop(this.size);
      // this.open.emit();
    } else {
      this._frontLayerRef?.lift();
      // this.close.emit();
    }
  }

}
