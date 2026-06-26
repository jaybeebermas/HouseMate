import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { AuthService } from '../../services/auth/auth.service';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  trend: number;
  trendLabel: string;
  color: string;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'created' | 'updated' | 'approved' | 'rejected' | 'deleted';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  template: `
    <div class="flex flex-col gap-6 pb-8 animate-fade-in-up">

      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-[#18305E] tracking-tight">Dashboard</h1>
          <p class="text-[#727272] text-sm font-medium mt-1">Welcome back, {{ authService.currentUser()?.first_name || 'Admin' }}. Here's your overview.</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[11px] text-[#a1a1aa] font-bold uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg">
            {{ currentDate }}
          </span>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div *ngFor="let card of statCards" 
             class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
          <div class="flex items-start justify-between mb-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 [ngClass]="card.color">
              <ng-icon [name]="card.icon" class="h-5 w-5"></ng-icon>
            </div>
            <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md"
                  [class.text-green-700]="card.trend >= 0"
                  [class.bg-green-50]="card.trend >= 0"
                  [class.text-red-700]="card.trend < 0"
                  [class.bg-red-50]="card.trend < 0">
              <ng-icon [name]="card.trend >= 0 ? 'heroArrowTrendingUp' : 'heroArrowTrendingDown'" class="h-3 w-3"></ng-icon>
              {{ card.trend >= 0 ? '+' : '' }}{{ card.trend }}%
            </span>
          </div>
          <p class="text-2xl font-black text-[#18305E] tracking-tight">{{ card.value.toLocaleString() }}</p>
          <p class="text-[12px] text-[#727272] font-medium mt-1">{{ card.label }}</p>
          <p class="text-[10px] text-[#a1a1aa] font-bold mt-1.5">{{ card.trendLabel }}</p>
        </div>
      </div>

      <!-- Main Grid: Activity + Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Recent Activity -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 class="text-sm font-bold text-[#18305E]">Recent Activity</h2>
            <button class="text-[11px] font-bold text-[#18305E]/60 hover:text-[#18305E] transition-colors uppercase tracking-wider">
              View All
            </button>
          </div>
          <div class="divide-y divide-slate-50">
            <div *ngFor="let activity of activities" 
                 class="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors duration-150">
              <!-- Activity Icon -->
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                   [ngClass]="{
                     'bg-[#CEEBFF]/70 text-[#18305E]': activity.type === 'created',
                     'bg-purple-50 text-purple-600': activity.type === 'updated',
                     'bg-green-50 text-green-600': activity.type === 'approved',
                     'bg-red-50 text-red-500': activity.type === 'rejected',
                     'bg-amber-50 text-amber-600': activity.type === 'deleted'
                   }">
                <ng-icon [name]="{
                  'created': 'heroUserPlus',
                  'updated': 'heroPencilSquare',
                  'approved': 'heroCheckBadge',
                  'rejected': 'heroXCircle',
                  'deleted': 'heroTrash'
                }[activity.type]" class="h-4 w-4"></ng-icon>
              </div>
              <!-- Activity Content -->
              <div class="flex-1 min-w-0">
                <p class="text-sm text-[#18305E] font-semibold">
                  <span class="font-bold">{{ activity.user }}</span>
                  <span class="font-medium text-[#485366]"> {{ activity.action }} </span>
                  <span class="font-bold">{{ activity.target }}</span>
                </p>
                <p class="text-[11px] text-[#a1a1aa] font-medium mt-0.5">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions / Info Panel -->
        <div class="flex flex-col gap-4">
          <!-- Pending Reviews -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h3 class="text-sm font-bold text-[#18305E] mb-3">Pending Reviews</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs">
                  JD
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-[#18305E] truncate">Juan Dela Cruz</p>
                  <p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Landlord Application</p>
                </div>
                <div class="flex gap-1">
                  <button class="w-7 h-7 rounded-md bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors">
                    <ng-icon name="heroCheck" class="h-3.5 w-3.5"></ng-icon>
                  </button>
                  <button class="w-7 h-7 rounded-md bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                    <ng-icon name="heroXMark" class="h-3.5 w-3.5"></ng-icon>
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs">
                  MC
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-[#18305E] truncate">Maria Cruz</p>
                  <p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Landlord Application</p>
                </div>
                <div class="flex gap-1">
                  <button class="w-7 h-7 rounded-md bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors">
                    <ng-icon name="heroCheck" class="h-3.5 w-3.5"></ng-icon>
                  </button>
                  <button class="w-7 h-7 rounded-md bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                    <ng-icon name="heroXMark" class="h-3.5 w-3.5"></ng-icon>
                  </button>
                </div>
              </div>
            </div>
            <a routerLink="/admin/users" class="inline-flex items-center gap-1.5 mt-4 text-[11px] font-bold text-[#18305E]/60 hover:text-[#18305E] transition-colors uppercase tracking-wider">
              View All Applications
              <ng-icon name="heroArrowRight" class="h-3 w-3"></ng-icon>
            </a>
          </div>

          <!-- System Overview -->
          <div class="bg-gradient-to-br from-[#18305E] to-[#254685] rounded-2xl p-5 shadow-lg shadow-[#18305E]/20">
            <h3 class="text-sm font-bold text-white/90 mb-3">System Overview</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-[#b5c9e8] font-medium">Server Status</span>
                <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  Operational
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-[#b5c9e8] font-medium">Database</span>
                <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  Connected
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-[#b5c9e8] font-medium">Active Sessions</span>
                <span class="text-[12px] text-white font-bold">24</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-[#b5c9e8] font-medium">API Latency</span>
                <span class="text-[12px] text-white font-bold">42ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  authService = inject(AuthService);

  currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  statCards: StatCard[] = [
    {
      label: 'Total Users',
      value: 2847,
      icon: 'heroUsers',
      trend: 12.5,
      trendLabel: 'vs last month',
      color: 'bg-[#CEEBFF]/70 text-[#18305E]'
    },
    {
      label: 'Active Landlords',
      value: 184,
      icon: 'heroBuildingOffice',
      trend: 8.2,
      trendLabel: 'vs last month',
      color: 'bg-green-50 text-green-600'
    },
    {
      label: 'Pending Approvals',
      value: 23,
      icon: 'heroClock',
      trend: -5.1,
      trendLabel: 'vs last month',
      color: 'bg-amber-50 text-amber-600'
    },
    {
      label: 'Listings Active',
      value: 456,
      icon: 'heroHome',
      trend: 15.3,
      trendLabel: 'vs last month',
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  activities: Activity[] = [
    {
      id: '1',
      user: 'Juan Dela Cruz',
      action: 'submitted a',
      target: 'Landlord Application',
      time: '2 minutes ago',
      type: 'created'
    },
    {
      id: '2',
      user: 'Maria Santos',
      action: 'was approved as',
      target: 'Landlord',
      time: '15 minutes ago',
      type: 'approved'
    },
    {
      id: '3',
      user: 'Admin User',
      action: 'updated the profile of',
      target: 'Pedro Reyes',
      time: '1 hour ago',
      type: 'updated'
    },
    {
      id: '4',
      user: 'System',
      action: 'rejected application from',
      target: 'Ana Lim',
      time: '2 hours ago',
      type: 'rejected'
    },
    {
      id: '5',
      user: 'Admin User',
      action: 'added a new listing:',
      target: '2BR Condo in BGC',
      time: '3 hours ago',
      type: 'created'
    }
  ];
}
