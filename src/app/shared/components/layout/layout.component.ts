import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-title">Menu</div>

        <nav class="sidebar-nav">
          <a
            class="nav-item"
            routerLink="/app/dashboard"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: false }"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 10.5L12 3L21 10.5V20A1 1 0 0 1 20 21H14V14H10V21H4A1 1 0 0 1 3 20V10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Home</span>
          </a>

          <a
            class="nav-item"
            routerLink="/app/users"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: false }"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M4 21C4 17.6863 7.58172 15 12 15C16.4183 15 20 17.6863 20 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Cá nhân</span>
          </a>

          <button class="nav-item nav-item-logout" type="button" (click)="onLogout()">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 16L19 12L15 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M11 4H5A2 2 0 0 0 3 6V18A2 2 0 0 0 5 20H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Đăng xuất</span>
          </button>
        </nav>
      </aside>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
      :host {
        display: block;
        min-height: 100vh;
      }

      .app-shell {
        display: flex;
        min-height: 100vh;
        background: #f4f7fb;
      }

      .sidebar {
        width: 240px;
        background: #0f172a;
        color: #e2e8f0;
        padding: 24px 16px;
        box-sizing: border-box;
      }

      .sidebar-title {
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.8;
        margin-bottom: 20px;
      }

      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 10px;
        text-decoration: none;
        color: #cbd5e1;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .nav-item-logout {
        width: 100%;
        border: 0;
        background: transparent;
        cursor: pointer;
        text-align: left;
        font: inherit;
      }

      .nav-item:hover {
        background: #1e293b;
        color: #ffffff;
      }

      .nav-item.active {
        background: #2563eb;
        color: #ffffff;
      }

      .nav-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .content {
        flex: 1;
        padding: 24px;
        box-sizing: border-box;
      }

      @media (max-width: 768px) {
        .app-shell {
          flex-direction: column;
        }

        .sidebar {
          width: 100%;
          padding: 12px;
        }

        .sidebar-title {
          margin-bottom: 10px;
        }

        .sidebar-nav {
          flex-direction: row;
        }

        .nav-item {
          flex: 1;
          justify-content: center;
        }
      }
    `],
})
export class LayoutComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
