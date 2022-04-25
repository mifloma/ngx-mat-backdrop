import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  backlayerColor: 'primary' | 'accent' = 'primary';

  constructor() { }
}
