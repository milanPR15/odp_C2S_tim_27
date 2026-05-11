export function TeamCreateGuide() {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/5 p-6 md:p-8">
      <h3 className="text-sm font-semibold text-white">Guidelines for Creation</h3>
      <div className="mt-6 space-y-6">
        <div className="flex gap-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-200">1</div>
          <div>
            <h4 className="text-sm font-medium text-white/90">Identity</h4>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-white/40">Select a unique team name and a 2-5 character tag that represents your squad.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-200">2</div>
          <div>
            <h4 className="text-sm font-medium text-white/90">Description</h4>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-white/40">Provide a brief description of your team to attract potential members and show your team's goals.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-200">3</div>
          <div>
            <h4 className="text-sm font-medium text-white/90">Logo</h4>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-white/40">Upload a clear, high-quality logo. It must be an image file under 5MB. A square aspect ratio works best.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-200">4</div>
          <div>
            <h4 className="text-sm font-medium text-white/90">Captain</h4>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-white/40">As the creator, you will automatically be assigned the Captain role. You can invite members later.</p>
          </div>
        </div>
      </div>
    </div>
  );
}