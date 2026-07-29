// Single headline number (a stat tile is the right "form" for one figure — no chart).
export default function StatTile({ label, value, accent = false }) {
  return (
    <div className="relative overflow-hidden rounded-card bg-white p-5 shadow-sm ring-1 ring-navy/5">
      {/* Thin accent rail keeps the revenue tile distinct without shouting. */}
      <div
        className={`absolute inset-y-0 left-0 w-1 ${accent ? 'bg-terracotta' : 'bg-navy/10'}`}
      />
      <div className="text-xs font-medium uppercase tracking-wide text-stone">{label}</div>
      <div
        className={`mt-1.5 font-display text-3xl ${accent ? 'text-terracotta' : 'text-navy'}`}
      >
        {value}
      </div>
    </div>
  );
}
