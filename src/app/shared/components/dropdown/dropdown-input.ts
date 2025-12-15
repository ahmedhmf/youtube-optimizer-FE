import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
} from '@angular/core';

interface DropdownOption {
  name: string;
  value: string;
}

@Component({
  selector: 'app-dropdown-input',
  imports: [],
  templateUrl: './dropdown-input.html',
  styleUrl: './dropdown-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownInput {

  dropdownOptions = input<DropdownOption[]>([]);
  placeholder = input<string>('Select an Option');
  isOpen = signal(false);
  selectedOption = signal<DropdownOption | null>(null);
  onSelect = output<DropdownOption>();

  constructor(private elementRef: ElementRef) {
  }

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
  }

  selectOption(option: DropdownOption): void {
    this.selectedOption.set(option);
    this.isOpen.set(false);
    this.onSelect.emit(option);
  }
}
