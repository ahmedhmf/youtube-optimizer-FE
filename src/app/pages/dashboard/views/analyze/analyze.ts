import { Component, computed, inject, Type } from '@angular/core';
import { analyzeStore } from '../../../../stores/dashboard/analyze.store';
import { Url } from './url/url';
import { Generation } from './generation/generation';
import { ThumbnailStyle } from './thumbnail-style/thumbnail-style';
import { Results } from './results/results';
import { NgClass, NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'app-analyze',
  imports: [NgComponentOutlet, NgClass],
  templateUrl: './analyze.html',
  styleUrl: './analyze.scss',
})
export class Analyze {
  store = inject(analyzeStore);

  stepsMap: Record<number, Type<any>> = {
    1: Url,
    2: Generation,
    3: ThumbnailStyle,
    4: Results,
  };

  currentComponent = computed(() => this.stepsMap[this.store.currentStep()]);
}
