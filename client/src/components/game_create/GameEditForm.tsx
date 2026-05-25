import { useMemo, useRef, useState } from "react";
import { gamesApi } from "../../api_services/games/GamesAPIService";
import type { UpdateGameDto, GameDto } from "../../models/game/GameTypes";
import { ErrorBox, Spinner, SuccessBox } from "../ui/UI";

export function GameEditForm({ game, onSaved, onCancel }: { game: GameDto; onSaved: (g: GameDto) => void; onCancel?: () => void }) {
  const [form, setForm] = useState<UpdateGameDto>({
    title: game.title,
    genre: game.genre,
    max_players: game.max_players,
    logo: game.logo,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const logoInputRef = useRef<HTMLInputElement>({} as HTMLInputElement);

  const isValid = useMemo(() => {
    return !!form.title && !!form.genre && (form.max_players === undefined || form.max_players >= 1) && (!!form.logo || form.logo === "");
  }, [form]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!isValid) { setError("Please fill required fields"); return; }
    setIsSubmitting(true);
    try {
      const res = await gamesApi.update(game.game_id, form);
      if (!res.success || !res.data) {
        setError(res.message || "Failed to update game");
        return;
      }
      setSuccess("Game updated successfully.");
      onSaved(res.data);
    } finally { setIsSubmitting(false); }
  }

  function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");
    setSuccess("");
    if (!file) {
      setForm((p) => ({ ...p, logo: "" }));
      setLogoFileName("");
      return;
    }
    if (!file.type.startsWith("image/")) { setError("Please upload an image file for the logo."); event.target.value = ""; return; }
    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) { setError("Logo image must be 5 MB or smaller."); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setForm((p) => ({ ...p, logo: result }));
        setLogoFileName(file.name);
      } else {
        setError("Failed to read the selected image.");
        event.target.value = "";
      }
    };
    reader.onerror = () => { setError("Failed to read the selected image."); event.target.value = ""; };
    reader.readAsDataURL(file);
  }

  const labelClass = "text-[11px] uppercase tracking-[0.18em] text-white/45 font-medium";
  const inputClass = "h-11 rounded-xl border border-white/12 bg-black/30 px-3 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-cyan-300/65 focus:bg-black/40 focus:shadow-[0_0_0_3px_rgba(103,232,249,0.12)]";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.06),transparent_42%),linear-gradient(to_bottom,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 md:p-8 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClass}>Title</span>
          <input value={form.title ?? ""} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputClass} />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Genre</span>
          <input value={form.genre ?? ""} onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))} className={inputClass} />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Max Players</span>
          <input type="number" min={1} value={form.max_players ?? 1} onChange={(e) => setForm((p) => ({ ...p, max_players: Number(e.target.value || 1) }))} className={inputClass} />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClass}>Logo image</span>
          <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="block h-11 w-full cursor-pointer rounded-xl border border-white/12 bg-black/30 text-sm text-white file:mr-4 file:h-full file:border-0 file:border-r file:border-white/12 file:bg-white/6 file:px-4 file:text-xs file:uppercase file:tracking-[0.14em] file:text-white/70 file:transition-colors hover:file:bg-white/10" />
        </label>

        <div className="md:col-span-2 mt-2 grid grid-cols-1 gap-4 rounded-2xl border border-cyan-200/12 bg-black/25 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center text-white/35 text-xs uppercase tracking-widest">
              {form.logo ? <img src={form.logo} alt={form.title ?? "logo"} className="h-full w-full object-cover" /> : "logo"}
            </div>
            <div>
              <p className="text-sm font-semibold text-white tracking-tight">{form.title ?? game.title}</p>
              <p className="text-xs text-white/35">{form.genre ?? game.genre} • up to {form.max_players ?? game.max_players} players</p>
              <p className="text-[11px] text-white/25 mt-0.5">{logoFileName || "Current logo"}</p>
            </div>
          </div>
          <p className="text-xs leading-5 text-white/30 lg:max-w-60 lg:text-right">Editing existing game. Changes are saved to the server.</p>
        </div>

        <div className="md:col-span-2 space-y-3">{error && <ErrorBox message={error} />}{success && <SuccessBox message={success} />}</div>

        <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 h-11 rounded-xl border border-cyan-300/45 bg-linear-to-r from-cyan-300/20 to-sky-300/10 px-5 text-sm font-semibold tracking-wide text-cyan-50 transition hover:from-cyan-300/30 hover:to-sky-300/20 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting && <Spinner size={14} />} Save changes
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="h-11 rounded-xl border border-white/10 px-4 text-sm text-white/60 hover:bg-white/4">Cancel</button>
          )}
        </div>
      </form>
    </div>
  );
}
