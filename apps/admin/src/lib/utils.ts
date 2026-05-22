import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface RoleSource {
  role?: string | { name?: string } | null;
  roleName?: string | null;
}

export function extractRoleString(user: RoleSource | null | undefined): string | null {
  if (!user) return null;
  
  const role = user.role;
  
  if (!role) {
    return user.roleName || null;
  }
  
  if (typeof role === 'string') {
    return role;
  }
  
  if (typeof role === 'object' && role !== null) {
    if (typeof role.name === 'string') {
      return role.name;
    }
  }
  
  return user.roleName || null;
}
