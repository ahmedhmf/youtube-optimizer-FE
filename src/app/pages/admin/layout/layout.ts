import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNav } from './side-nav/side-nav';
import { TopBar } from './top-bar/top-bar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SideNav, TopBar],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Layout {}
