import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-unauthorized',
  imports: [RouterLink, Button],
  template: `
    <div class="unauthorized-wrapper">
      <div class="unauthorized-card">
        <i class="pi pi-lock unauthorized-icon"></i>
        <h1 class="unauthorized-title">Access Denied</h1>
        <p class="unauthorized-message">
          You don't have permission to view this page.
        </p>
        <p-button
          label="Go to Employees"
          icon="pi pi-arrow-left"
          routerLink="/employees"
          severity="primary" />
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }
    .unauthorized-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem 4rem;
      background: var(--surface-card);
      border-radius: 12px;
      border: 1px solid var(--surface-border);
      text-align: center;
    }
    .unauthorized-icon {
      font-size: 3rem;
      color: var(--red-400);
    }
    .unauthorized-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-color);
    }
    .unauthorized-message {
      margin: 0;
      color: var(--text-color-secondary);
      font-size: 1rem;
    }
  `],
})
export class UnauthorizedComponent {}
