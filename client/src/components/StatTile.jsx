// Single headline number (a stat tile is the right "form" for one figure — no chart).
export default function StatTile({ label, value, accent = false }) {
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-navy/5">
      <div className="text-sm text-navy/50">{label}</div>
      <div className={`mt-1 font-display text-3xl ${accent ? 'text-terracotta' : 'text-navy'}`}>
        {value}
      </div>
    </div>
  );
}
