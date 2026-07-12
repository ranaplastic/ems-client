import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, CreditCard, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/cn';

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/receivables', label: 'Balance', icon: Wallet },
  { to: '/profile', label: 'Profile', icon: User },
] as const;

/** Desktop sidebar navigation (hidden on mobile). */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
          RP
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">Rana Plastics</p>
          <p className="text-xs text-slate-400">Client Portal</p>
        </div>
      </div>
      <nav className="space-y-1 p-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
