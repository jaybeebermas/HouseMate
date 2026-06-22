import { Component, OnInit, signal, inject, computed, ViewChild, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { GraphqlService } from '../../services/graphql/graphql.service';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';
import { LoadingService } from '../../services/loading/loading.service';
import { GET_USERS, CREATE_USER, UPDATE_USER, DELETE_USER, APPROVE_LANDLORD, REJECT_LANDLORD } from '../../services/User/user.gql';
import { User } from '../../services/User/user.types';
import { CreateUserInput, UpdateUserInput } from '../../services/User/user.input';
import { RoleService, Role } from '../../services/role/role.service';
import { ConfirmDeleteComponent } from '../../shared/components/ui/confirm-delete/confirm-delete.component';


import { DrawerComponent } from '../../shared/components/ui/drawer/drawer.component';
import { ModalService } from '../../services/modal/modal.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgIconComponent } from '@ng-icons/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SelectComponent } from '../../shared/components/ui/select/select.component';

import { UserManagementLayoutComponent } from '../../shared/components/ui/user-management/user-management-layout.component';
import { PageHeaderComponent } from '../../shared/components/ui/user-management/page-header.component';
import { SearchFiltersComponent } from '../../shared/components/ui/user-management/search-filters.component';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';


@Component({
  selector: 'app-user-action-menu',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTooltipModule, NgIconComponent, HasPermissionDirective],
  template: `
    <div class="flex items-center justify-end gap-1.5 transition-all">
      <button *hasPermission="'user.view'" type="button" class="flex items-center justify-center w-8 h-8 rounded-full text-[#18305E] hover:bg-[#CEEBFF] transition-colors" (click)="view.emit()" matTooltip="View details">
        <ng-icon name="heroEye" class="text-[17px]"></ng-icon>
      </button>
      <button *hasPermission="'user.edit'" type="button" class="flex items-center justify-center w-8 h-8 rounded-full text-pink-600 hover:bg-pink-50 transition-colors" (click)="edit.emit()" matTooltip="Edit user">
        <ng-icon name="heroPencil" class="text-[17px]"></ng-icon>
      </button>
      <button *ngIf="status === 'pending'" type="button" class="flex items-center justify-center w-8 h-8 rounded-full text-green-600 hover:bg-green-50 transition-colors" (click)="approve.emit()" matTooltip="Approve Landlord">
        <ng-icon name="heroCheckCircle" class="text-[17px]"></ng-icon>
      </button>
      <button *ngIf="status === 'pending'" type="button" class="flex items-center justify-center w-8 h-8 rounded-full text-amber-600 hover:bg-amber-50 transition-colors" (click)="reject.emit()" matTooltip="Reject Landlord">
        <ng-icon name="heroXCircle" class="text-[17px]"></ng-icon>
      </button>
      <button *hasPermission="'user.delete'" type="button" class="flex items-center justify-center w-8 h-8 rounded-full text-red-500 hover:bg-red-50 transition-colors" (click)="delete.emit()" matTooltip="Delete user">
        <ng-icon name="heroTrash" class="text-[17px]"></ng-icon>
      </button>
    </div>
  `
})
export class UserActionMenuComponent {
  @Input() status?: string;
  @Output() view = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() approve = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();

}

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, UserActionMenuComponent, NgIconComponent],
  template: `
    <div class="flex-1 flex flex-col min-h-0">
      <div class="hidden md:block overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#F4F6F9] border-b border-slate-200">
              <th class="px-8 py-4 text-[10px] font-bold text-[#727272] uppercase tracking-widest">User Profile</th>
              <th class="px-8 py-4 text-[10px] font-bold text-[#727272] uppercase tracking-widest text-center">System Role</th>
              <th class="px-8 py-4 text-[10px] font-bold text-[#727272] uppercase tracking-widest text-center">Landlord Status</th>
              <th class="px-8 py-4 text-[10px] font-bold text-[#727272] uppercase tracking-widest">Email Address</th>
              <th class="px-8 py-4 text-[10px] font-bold text-[#727272] uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200/50">
            <tr *ngFor="let user of users" class="hover:bg-[#CEEBFF]/30 transition-all group">
              <td class="px-8 py-4">
                <div class="flex items-center gap-4">
                  <div>
                    <span class="block text-sm font-bold text-[#18305E] leading-none mb-1.5">{{ user.first_name }} {{ user.last_name }}</span>
                    <span class="text-[11px] text-[#727272] font-semibold tracking-tight">@{{ user.username }}</span>
                  </div>
                </div>
              </td>
              <td class="px-8 py-4 text-center">
                <span
                  [class.bg-[#CEEBFF]]="user.role === 'super_admin'"
                  [class.text-[#18305E]]="user.role === 'super_admin'"
                  [class.bg-[#CEEBFF]]="user.role !== 'super_admin'"
                  [class.text-[#18305E]]="user.role !== 'super_admin'"
                  class="inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {{ formatRoleName(user.role) }}
                </span>
              </td>
              <td class="px-8 py-4 text-center">
                <span *ngIf="user.landlord_status === 'pending'" class="inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">
                  Pending
                </span>
                <span *ngIf="user.landlord_status === 'approved'" class="inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700">
                  Approved
                </span>
                <span *ngIf="user.landlord_status === 'rejected'" class="inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700">
                  Rejected
                </span>
                <span *ngIf="!user.landlord_status || user.landlord_status === 'none'" class="inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500">
                  None
                </span>
              </td>
              <td class="px-8 py-4 text-xs font-medium text-[#485366]">{{ user.email }}</td>
              <td class="px-8 py-4 text-right whitespace-nowrap">
                <app-user-action-menu
                  [status]="user.landlord_status"
                  (view)="view.emit(user)"
                  (edit)="edit.emit(user)"
                  (delete)="delete.emit(user.id)"
                  (approve)="approve.emit(user.id)"
                  (reject)="reject.emit(user.id)">
                </app-user-action-menu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="md:hidden flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4F6F9]/30">
        <div *ngFor="let user of users" class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
          <div class="flex justify-between items-start mb-5">
            <div class="flex items-center gap-4">
              <div class="h-11 w-11 rounded-xl bg-[#18305E] flex items-center justify-center text-white font-bold text-sm">
                {{ user.first_name?.[0] }}{{ user.last_name?.[0] }}
              </div>
              <div>
                <h4 class="font-bold text-[#18305E] text-sm leading-tight">{{ user.first_name }} {{ user.last_name }}</h4>
                <p class="text-[11px] text-[#727272] font-bold uppercase tracking-tighter mt-0.5">@{{ user.username }}</p>
              </div>
            </div>
            <app-user-action-menu
              [status]="user.landlord_status"
              (view)="view.emit(user)"
              (edit)="edit.emit(user)"
              (delete)="delete.emit(user.id)"
              (approve)="approve.emit(user.id)"
              (reject)="reject.emit(user.id)">
            </app-user-action-menu>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-3">
            <div class="flex flex-col gap-1">
              <span class="text-[#727272] font-bold uppercase tracking-widest text-[9px]">Account Role</span>
              <span
                [class.bg-[#CEEBFF]]="user.role === 'super_admin'"
                [class.text-[#18305E]]="user.role === 'super_admin'"
                [class.bg-[#CEEBFF]]="user.role !== 'super_admin'"
                [class.text-[#18305E]]="user.role !== 'super_admin'"
                class="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest w-fit">
                {{ formatRoleName(user.role) }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[#727272] font-bold uppercase tracking-widest text-[9px]">Landlord Status</span>
              <span *ngIf="user.landlord_status === 'pending'" class="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 w-fit">Pending</span>
              <span *ngIf="user.landlord_status === 'approved'" class="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-700 w-fit">Approved</span>
              <span *ngIf="user.landlord_status === 'rejected'" class="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-700 w-fit">Rejected</span>
              <span *ngIf="!user.landlord_status || user.landlord_status === 'none'" class="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 w-fit">None</span>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div class="flex flex-col gap-1">
              <span class="text-[#727272] font-bold uppercase tracking-widest text-[9px]">Email Address</span>
              <span class="text-[#485366] font-bold text-[10px] truncate">{{ user.email }}</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="users.length === 0 && !isLoading" class="p-20 text-center">
        <div class="inline-flex items-center justify-center p-6 bg-[#F4F6F9] rounded-xl mb-6 shadow-inner">
          <ng-icon name="heroUsers" class="h-10 w-10 text-[#727272]"></ng-icon>
        </div>
        <h3 class="text-[#18305E] text-xl font-black mb-2 tracking-tight">No records found</h3>
        <p class="text-[#485366] font-medium max-w-sm mx-auto text-base">It looks like there are no results matching your criteria.</p>
      </div>

      <div *ngIf="isLoading" class="flex flex-col items-center justify-center p-24 gap-4">
        <div class="animate-spin h-10 w-10 border-4 border-[#18305E] border-t-transparent rounded-full"></div>
        <p class="text-xs font-bold text-[#727272] uppercase tracking-widest">Loading Records...</p>
      </div>
      <ng-content select="app-table-pagination"></ng-content>
    </div>
  `
})
export class UserTableComponent {
  @Input() users: any[] = [];
  @Input() isLoading: boolean = false;
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<string>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();

  formatRoleName(name: string): string {
    if (!name) return '';
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

import { TablePaginationComponent } from '../../shared/components/ui/user-management/table-pagination.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UserManagementLayoutComponent,
    PageHeaderComponent,
    SearchFiltersComponent,
    UserTableComponent,
    TablePaginationComponent,
    SelectComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatMenuModule,
    NgIconComponent,
    DrawerComponent,
    ConfirmDeleteComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  @ViewChild('userModal') userModalTemplate!: TemplateRef<any>;
  @ViewChild('deleteModal') deleteModalTemplate!: TemplateRef<any>;

  userToDelete = signal<User | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly gql = inject(GraphqlService);
  public readonly auth = inject(AuthService);
  private readonly toastService = inject(ToastService);
  public readonly modalService = inject(ModalService);
  private readonly roleService = inject(RoleService);
  private readonly loadingService = inject(LoadingService);

  users = signal<User[]>([]);
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredUsers().slice(start, end);
  });
  isLoading = signal(false);
  isDrawerOpen = signal(false);
  modalMode = signal<'add' | 'edit' | 'view'>('add');
  userForm: FormGroup;
  selectedUserId = signal<string | null>(null);
  roles = signal<Role[]>([]);
  originalUserFormValue: any = null;

  selectedRole = signal<string>('');

  private readonly roleDisplayOrder = ['super_admin', 'admin', 'user', 'guest', 'landlord'];

  roleFilterOptions = computed(() => {
    const apiRoles = this.roles().map(r => r.name);
    return [
      { name: 'All Roles', value: '' },
      ...this.roleDisplayOrder
        .filter(name => apiRoles.includes(name))
        .map(name => ({ name: this.formatRoleName(name), value: name }))
    ];
  });

  modalRoleOptions = computed(() => {
    const apiRoles = this.roles().map(r => r.name);
    return this.roleDisplayOrder
      .filter(name => apiRoles.includes(name))
      .map(name => ({ name: this.formatRoleName(name), value: name }));
  });

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const roleFilter = this.selectedRole();
    let list = this.users();

    if (roleFilter) {
      list = list.filter(u => u.role === roleFilter);
    }

    if (!term) return list;
    return list.filter(u =>
      u.first_name.toLowerCase().includes(term) ||
      u.last_name.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  hasChanges(): boolean {
    if (!this.originalUserFormValue) return false;

    const current = this.userForm.value;
    const original = this.originalUserFormValue;

    for (const key of Object.keys(current)) {
      if ((key === 'password' || key === 'confirm_password') && !current[key]) {
        continue;
      }
      if (current[key] !== original[key]) {
        return true;
      }
    }
    return false;
  }

  syncModalConfirmState(): void {
    const isFormInvalid = this.userForm.invalid;
    const hasNoChanges = !this.hasChanges();
    this.modalService.setConfirmDisabled(isFormInvalid || hasNoChanges);
  }

  constructor() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      confirm_password: ['', [this.confirmPasswordValidator.bind(this)]],
      role: ['admin', [Validators.required]],
    });
  }

  confirmPasswordValidator(control: import('@angular/forms').AbstractControl): import('@angular/forms').ValidationErrors | null {
    if (!control.parent) return null;
    const password = control.parent.get('password')?.value;
    const confirmPassword = control.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  formatRoleName(name: string): string {
    if (!name) return '';
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.userForm.get('password')?.valueChanges.subscribe(() => {
      this.userForm.get('confirm_password')?.updateValueAndValidity();
    });

    // Sync form validity with global modal confirm button
    this.userForm.valueChanges.subscribe(() => {
      this.syncModalConfirmState();
    });
  }

  async loadRoles(): Promise<void> {
    try {
      const dbRoles = await this.roleService.getAll();
      console.log('Raw roles from API:', dbRoles);
      this.roles.set(dbRoles || []);
    } catch (error) {
      console.error('Failed to load database roles:', error);
    }
  }

  async loadUsers(): Promise<void> {
    this.isLoading.set(true);
    this.loadingService.show();
    try {
      const response = await this.gql.request<{ users: User[] }>(GET_USERS);
      console.log('Users loaded:', response);
      this.users.set(response.users || []);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      this.isLoading.set(false);
      this.loadingService.hide();
    }
  }

  handleSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  handlePageSearch(index: number): void {
    this.currentPage.set(index);
  }

  openAddModal(): void {
    this.modalMode.set('add');
    this.userForm.enable();
    this.userForm.reset();
    const hasAdmin = this.roles().some(r => r.name === 'admin');
    if (hasAdmin) {
      this.userForm.get('role')?.setValue('admin');
    } else if (this.roles().length > 0) {
      this.userForm.get('role')?.setValue(this.roles()[0].name);
    } else {
      this.userForm.get('role')?.setValue('admin');
    }
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();

    this.modalService.open(this.userModalTemplate, {
      title: 'Add New System User',
      subtitle: 'Personnel Information',
      confirmLabel: 'Register User'
    });
    this.isDrawerOpen.set(false);
    this.modalService.onConfirm = () => this.handleSubmit();
    this.originalUserFormValue = this.userForm.value;
    this.syncModalConfirmState();
  }

  async openEditModal(user: User): Promise<void> {
    this.modalMode.set('edit');
    this.userForm.enable();
    this.selectedUserId.set(user.id);
    this.userForm.patchValue({ ...user, password: '', confirm_password: '' });
    this.userForm.get('password')?.setValidators([Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();

    this.modalService.open(this.userModalTemplate, {
      title: 'Edit System User',
      subtitle: 'Personnel Information',
      confirmLabel: 'Update Account'
    });
    this.isDrawerOpen.set(false);
    this.modalService.onConfirm = () => this.handleSubmit();
    this.originalUserFormValue = this.userForm.value;
    this.syncModalConfirmState();
  }

  openViewModal(user: User): void {
    this.modalMode.set('view');
    this.userForm.patchValue(user);
    this.userForm.disable();
    this.isDrawerOpen.set(true);
  }

  closeModal(): void {
    this.isDrawerOpen.set(false);
    this.modalService.close();
    this.userForm.enable();
    this.selectedUserId.set(null);
  }

  async handleSubmit(): Promise<void> {
    if (this.userForm.invalid) return;

    this.modalService.setLoading(true);
    this.loadingService.show();
    try {
      if (this.modalMode() === 'add') {
        const input: CreateUserInput = this.userForm.value;
        delete (input as any).confirm_password;
        await this.gql.request(CREATE_USER, { input });
      } else {
        const input: UpdateUserInput = { ...this.userForm.value, id: this.selectedUserId() };
        delete (input as any).confirm_password;
        if (!input.password) delete input.password;
        await this.gql.request(UPDATE_USER, { input });
      }
      await this.loadUsers();
      this.closeModal();
      this.toastService.show(this.modalMode() === 'add' ? 'User registered successfully!' : 'Account updated successfully!', 'success');
    } catch (error) {
      console.error('Operation failed', error);
      this.toastService.show('Operation failed. Please try again.', 'error');
    } finally {
      this.modalService.setLoading(false);
      this.loadingService.hide();
    }
  }

  async deleteUser(id: string): Promise<void> {
    const user = this.users().find(u => u.id === id);
    if (!user) return;

    this.userToDelete.set(user);
    this.modalService.open(this.deleteModalTemplate, {
      title: 'Delete User',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger',
      maxWidth: 'max-w-md'
    });
    this.modalService.onConfirm = () => this.confirmDeleteUser();
  }

  async confirmDeleteUser(): Promise<void> {
    const user = this.userToDelete();
    if (!user) return;

    this.modalService.setLoading(true);
    try {
      await this.gql.request(DELETE_USER, { id: user.id });
      await this.loadUsers();
      this.toastService.show('User deleted successfully!', 'success');
      this.modalService.close();
    } catch (error) {
      console.error('Delete failed', error);
      this.toastService.show('Failed to delete user.', 'error');
    } finally {
      this.modalService.setLoading(false);
    }
  }

  async approveLandlord(userId: string): Promise<void> {
    this.loadingService.show();
    try {
      await this.gql.request(APPROVE_LANDLORD, { id: userId });
      await this.loadUsers();
      this.toastService.show('Landlord application approved!', 'success');
    } catch (error) {
      console.error('Approve failed', error);
      this.toastService.show('Failed to approve landlord.', 'error');
    } finally {
      this.loadingService.hide();
    }
  }

  async rejectLandlord(userId: string): Promise<void> {
    this.loadingService.show();
    try {
      await this.gql.request(REJECT_LANDLORD, { id: userId });
      await this.loadUsers();
      this.toastService.show('Landlord application rejected.', 'success');
    } catch (error) {
      console.error('Reject failed', error);
      this.toastService.show('Failed to reject landlord.', 'error');
    } finally {
      this.loadingService.hide();
    }
  }
}
