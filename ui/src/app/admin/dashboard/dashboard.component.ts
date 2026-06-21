import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white rounded-2xl shadow-sm border border-zinc-200/50">
      <h1 class="text-2xl font-black text-zinc-900 tracking-tight">Dashboard Placeholder</h1>
      <p class="text-zinc-500 font-medium mt-2">Welcome to your new HouseMate Admin Dashboard!</p>
    </div>
  `
})
export class DashboardComponent {}
