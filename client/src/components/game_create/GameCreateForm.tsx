import { useMemo, useRef, useState } from "react";
import { gamesApi } from "../../api_services/games/GamesAPIService";
import type { CreateGameDto } from "../../models/game/GameTypes";
import { ErrorBox, Spinner, SuccessBox } from "../ui/UI";

function getInitialForm(): CreateGameDto {
  return {
    title: "",
    genre: "",
    max_players: 5,
    logo: "",
  };
}

export function GameCreateForm() {
  const [form, setForm] = useState<CreateGameDto>(getInitialForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const logoInputRef = useRef<HTMLInputElement>({} as HTMLInputElement);

  const isValid = useMemo(() => {
    return form.title.trim().length >= 2
      && form.genre.trim().length >= 2
      && form.max_players >= 1
      && form.logo.trim().length >= 3;
  }, [form]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isValid) {
      setError("Please fill in title, genre, max players, and upload a valid logo image.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateGameDto = {
        title: form.title.trim(),
        genre: form.genre.trim(),
        max_players: Number(form.max_players),
        logo: form.logo.trim(),
      };

      const res = await gamesApi.create(payload);
      if (!res.success) {
        setError(res.message || "Failed to create game.");
        return;
      }

      setSuccess("Game created successfully.");
      setForm(getInitialForm());
      setLogoFileName("");
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");
    setSuccess("");

    if (!file) {
      setForm((prev) => ({ ...prev, logo: "" }));
      setLogoFileName("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setForm((prev) => ({ ...prev, logo: "" }));
      setLogoFileName("");
      setError("Please upload an image file for the logo.");
      event.target.value = "";
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setForm((prev) => ({ ...prev, logo: "" }));
      setLogoFileName("");
      setError("Logo image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setForm((prev) => ({ ...prev, logo: result }));
        setLogoFileName(file.name);
      } else {
        setForm((prev) => ({ ...prev, logo: "" }));
        setLogoFileName("");
        setError("Failed to read the selected image.");
        event.target.value = "";
      }
    };
    reader.onerror = () => {
      setForm((prev) => ({ ...prev, logo: "" }));
      setLogoFileName("");
      setError("Failed to read the selected image.");
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  }

  const previewTitle = form.title.trim() || "Game title";
  const previewGenre = form.genre.trim() || "Genre";
  const labelClass = "text-[11px] uppercase tracking-[0.18em] text-white/45 font-medium";
  const inputClass = "h-11 rounded-xl border border-white/12 bg-black/30 px-3 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-cyan-300/65 focus:bg-black/40 focus:shadow-[0_0_0_3px_rgba(103,232,249,0.12)]";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_42%),linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 md:p-8 backdrop-blur-sm">
      <div className="pointer-events-none absolute -top-20 -left-14 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-40 w-40 rounded-full bg-sky-200/10 blur-3xl" />

      <div className="relative mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/65 font-mono">Game details</p>
          <h2 className="mt-2 text-xl font-semibold text-white tracking-tight">Create a new game entry</h2>
          <p className="mt-2 text-sm leading-6 text-white/35 max-w-2xl">Submit title, genre, player capacity, and logo image.</p>
        </div>
        <div className="hidden md:inline-flex items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-cyan-100/80">
          Admin only
        </div>
      </div>

      <form onSubmit={onSubmit} className="relative grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClass}>Title</span>
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Valor Arena"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Genre</span>
          <input
            value={form.genre}
            onChange={(e) => setForm((prev) => ({ ...prev, genre: e.target.value }))}
            placeholder="MOBA"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Max Players</span>
          <input
            type="number"
            min={1}
            value={form.max_players}
            onChange={(e) => setForm((prev) => ({ ...prev, max_players: Number(e.target.value || 1) }))}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClass}>Logo image</span>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="block h-11 w-full cursor-pointer rounded-xl border border-white/12 bg-black/30 text-sm text-white file:mr-4 file:h-full file:border-0 file:border-r file:border-white/12 file:bg-white/6 file:px-4 file:text-xs file:uppercase file:tracking-[0.14em] file:text-white/70 file:transition-colors hover:file:bg-white/10"
          />
        </label>

        <div className="md:col-span-2 mt-2 grid grid-cols-1 gap-4 rounded-2xl border border-cyan-200/12 bg-black/25 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center text-white/35 text-xs uppercase tracking-widest">
              {form.logo.trim() ? (
                <img src={form.logo.trim()} alt={form.title.trim() || "Game logo preview"} className="h-full w-full object-cover" />
              ) : (
                "logo"
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white tracking-tight">{previewTitle}</p>
              <p className="text-xs text-white/35">{previewGenre} • up to {form.max_players} players</p>
              <p className="text-[11px] text-white/25 mt-0.5">{logoFileName || "No logo selected"}</p>
            </div>
          </div>
          <p className="text-xs leading-5 text-white/30 lg:max-w-60 lg:text-right">Stored fields: title, genre, max_players, and Base64 logo in the existing TEXT column.</p>
        </div>

        <div className="md:col-span-2 space-y-3">
          {error && <ErrorBox message={error} />}
          {success && <SuccessBox message={success} />}
        </div>

        <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="inline-flex items-center gap-2 h-11 rounded-xl border border-cyan-300/45 bg-linear-to-r from-cyan-300/20 to-sky-300/10 px-5 text-sm font-semibold tracking-wide text-cyan-50 transition hover:from-cyan-300/30 hover:to-sky-300/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting && <Spinner size={14} />}
            Create Game
          </button>
        </div>
      </form>
    </div>
  );
}