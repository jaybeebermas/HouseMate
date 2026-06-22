import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="flex flex-col gap-6">
      <div class="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
        <h1 class="text-2xl font-black text-[#18305E] tracking-tight">Dashboard Overview</h1>
        <p class="text-[#485366] font-medium mt-2">Welcome to your HouseMate Admin Dashboard!</p>
      </div>
    </div>
  `
})
export class DashboardComponent {}
