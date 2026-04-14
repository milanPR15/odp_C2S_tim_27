export function TournamentCreateGuide() {
  return (
    <aside className="rounded-3xl border border-white/10 bg-linear-to-b from-cyan-300/10 to-blue-300/5 p-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/75 mb-2">Quick Guide</p>
      <h3 className="text-white text-lg font-semibold tracking-tight mb-4">Make It Competitive</h3>

      <div className="space-y-3 text-sm text-white/75">
        <p>
          Pick a clear tournament name because it must be unique.
        </p>
        <p>
          Set the entry deadline before the event starts so registration can close automatically.
        </p>
        <p>
          Keep max teams aligned with your bracket format to avoid manual re-seeding later.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-widest text-white/40">Formats</p>
        <ul className="mt-3 space-y-2 text-sm text-white/70">
          <li>Single elimination: fastest, high stakes.</li>
          <li>Double elimination: more balanced and forgiving.</li>
          <li>Round robin: best for smaller groups.</li>
        </ul>
      </div>
    </aside>
  );
}