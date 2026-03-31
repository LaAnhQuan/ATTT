import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet],
    template: `
    <!-- Basic layout structure -->
    <header>
      <!-- Header content, navigation, user info -->
      <h1>My App</h1>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer>
      <!-- Footer content -->
    </footer>
  `,
    styles: [],
})
export class LayoutComponent { }
