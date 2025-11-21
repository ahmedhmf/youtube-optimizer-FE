import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorHandling } from './error-handling/error-handling/error-handling';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorHandling],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('youtube-optimizer-FE');
}
