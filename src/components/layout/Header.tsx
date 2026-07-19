import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

/** Top header with client identity and logout. */
export function Header() {
  const client = useAuthStore((s) => s.client);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const initials = (client?.name ?? 'C')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="lg:hidden">
        <p className="text-sm font-semibold text-slate-900">Rana Plastics</p>
        <p className="text-xs text-slate-400">Client Portal</p>
      </div>

      <div className="relative ml-auto">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {initials}
          </span>
          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            {client?.name}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-56 animate-fade-in rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="truncate text-sm font-medium text-slate-800">{client?.name}</p>
                <p className="truncate text-xs text-slate-400">
                  Client #{client?.clientId}
                </p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/profile');
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
