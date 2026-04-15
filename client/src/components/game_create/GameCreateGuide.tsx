const prepChecklist = [
  { label: "Title", detail: "Choose a clear and unique game name with at least 2 characters." },
  { label: "Genre", detail: "Use a short category players can recognize quickly (for example FPS, MOBA, RTS)." },
  { label: "Max Players", detail: "Set a realistic number for one full game session." },
  { label: "Logo Image", detail: "Prepare a clean image file (PNG/JPG), ideally under 5 MB for faster upload." },
];

const creationSteps = [
  "Open the Create Game form from the admin section.",
  "Enter title, genre, and max players.",
  "Select the logo image file and confirm the preview card shows the correct logo.",
  "Click Create Game and wait for the success message.",
  "Open Games Catalog to verify the new game appears for all users.",
];

const troubleshootingTips = [
  "If the submit button stays disabled, check that all required fields are filled and a logo is uploaded.",
  "If upload fails, try a smaller image file.",
  "If creation fails, use a different title because titles must be unique.",
];

export function GameCreateGuide() {
  return (
    <aside className="rounded-3xl border border-white/10 bg-white/4 p-6 md:p-8 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-widest text-white/35 font-mono">Manual</p>
      <h2 className="mt-2 text-lg font-semibold text-white tracking-tight">How to create a game</h2>
      <div className="mt-5 space-y-3">
        {prepChecklist.map((field) => (
          <div key={field.label} className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-sm font-medium text-white">{field.label}</p>
            <p className="mt-1 text-xs leading-5 text-white/32">{field.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-cyan-300/15 bg-cyan-300/8 p-4">
        <p className="text-sm font-medium text-cyan-100">Step-by-step</p>
        <ul className="mt-3 space-y-2 text-sm text-cyan-50/75">
          {creationSteps.map((step) => (
            <li key={step} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-200/80 shrink-0" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-white/8 bg-black/20 p-4">
        <p className="text-sm font-medium text-white">Common issues</p>
        <ul className="mt-3 space-y-2 text-sm text-white/65">
          {troubleshootingTips.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/45 shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}