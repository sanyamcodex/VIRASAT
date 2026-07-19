import { NavLink, useNavigate } from 'react-router-dom';
import { doLogout } from '../lib/auth';
import Button from '../components/ui/Button';

const itemClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-terracotta text-cream' : 'text-cream/70 hover:bg-cream/10 hover:text-cream'
  }`;

// Shared sidebar shell for the artisan + admin dashboards.
export default function DashboardLayout({ title, items, children }) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-cream text-navy">
      <aside className="flex w-60 flex-col bg-navy p-6 text-cream">
        <div className="font-display text-2xl font-bold">VIRASAT</div>
        <div className="mt-1 text-xs uppercase tracking-widest text-gold">{title}</div>

        <nav className="mt-8 flex-1 space-y-1">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className={itemClass}>
              {it.label}
            </NavLink>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="sm"
          className="justify-start text-cream/80 hover:bg-cream/10 hover:text-cream"
          onClick={async () => {
            await doLogout();
            navigate('/login');
          }}
        >
          Log out
        </Button>
      </aside>

      <div className="flex-1">
        <main className="mx-auto max-w-6xl px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
