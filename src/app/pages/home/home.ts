import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Home {}
