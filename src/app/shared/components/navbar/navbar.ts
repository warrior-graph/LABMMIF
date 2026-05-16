import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    MatToolbar,
    MatButton,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    MatDivider,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  protected readonly authService = inject(AuthService);
}
