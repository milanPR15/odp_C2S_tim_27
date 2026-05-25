import { useMemo, useRef, useState } from "react";
import { teamsApi } from "../../api_services/teams/TeamsAPIService";
import type { CreateTeamDto } from "../../models/team/TeamTypes";
import { ErrorBox, Spinner, SuccessBox } from "../ui/UI";

function getInitialForm(): CreateTeamDto {
  return {
    team_name: "",
    tag: "",
    description: "",
    logo: "",
  };
}

export function TeamCreateForm() {
  const [form, setForm] = useState<CreateTeamDto>(getInitialForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const logoInputRef = useRef<HTMLInputElement>({} as HTMLInputElement);

  const isValid = useMemo(() => {
    return form.team_name.trim().length >= 2
      && form.tag.trim().length >= 2
      && form.tag.trim().length <= 5;
  }, [form]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isValid) {
      setError("Please fill in team name and a valid tag (2-5 characters).");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateTeamDto = {
        team_name: form.team_name.trim(),
        tag: form.tag.trim().toUpperCase(),
        description: form.description?.trim() || undefined,
        logo: form.logo?.trim() || undefined,
      };

      const res = await teamsApi.createTeam(payload);
      if (!res.success) {
        setError(res.message || "Failed to create team.");
        return;
      }

      setSuccess("Team created successfully.");
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

  const labelClass = "text-[11px] uppercase tracking-[0.18em] text-white/45 font-medium";
  const inputClass = "h-11 w-full rounded-xl border border-white/12 bg-black/30 px-3 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-violet-300/65 focus:bg-black/40 focus:shadow-[0_0_0_3px_rgba(167,139,250,0.12)]";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.14),transparent_42%),linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 md:p-8 backdrop-blur-sm">
      <div className="pointer-events-none absolute -top-20 -left-14 h-44 w-44 rounded-full bg-violet-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-40 w-40 rounded-full bg-fuchsia-200/10 blur-3xl" />

      <div className="relative mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-violet-100/65 font-mono">Team details</p>
          <h2 className="mt-2 text-xl font-semibold text-white tracking-tight">Create a new team</h2>
          <p className="mt-2 text-sm leading-6 text-white/35 max-w-2xl">Create your own team, invite friends, and compete in tournaments.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="relative grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClass}>Team Name</span>
          <input
            value={form.team_name}
            onChange={(e) => setForm((prev) => ({ ...prev, team_name: e.target.value }))}
            placeholder="Nova Esports"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Tag</span>
          <input
            value={form.tag}
            onChange={(e) => setForm((prev) => ({ ...prev, tag: e.target.value }))}
            placeholder="NVA"
            maxLength={5}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClass}>Description</span>
          <textarea
            value={form.description || ""}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="A brief description of your team..."
            className={`${inputClass} min-h-25 py-3 resize-y`}
          />
        </label>

        <div className="flex flex-col gap-2 md:col-span-2">
          <span className={labelClass}>Team Logo</span>
          {form.logo ? (
            <div className="mt-1 flex items-center gap-4 border border-white/8 bg-white/5 rounded-xl p-3 pr-4">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black flex items-center justify-center">
                <img src={form.logo} alt="Preview" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60 truncate">{logoFileName}</p>
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, logo: "" }));
                    setLogoFileName("");
                    if (logoInputRef.current) logoInputRef.current.value = "";
                  }}
                  className="mt-1 text-[10px] uppercase tracking-wider text-red-300 hover:text-red-200 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className={`${inputClass} flex items-center justify-between cursor-pointer group hover:border-violet-300/40`}>
              <span className="text-white/40 group-hover:text-white/60 transition-colors">
                Choose image file...
              </span>
              <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/60 group-hover:text-white/80 transition-colors">
                Browse
              </span>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {error && <div className="md:col-span-2"><ErrorBox message={error} /></div>}
        {success && <div className="md:col-span-2"><SuccessBox message={success} /></div>}

        <div className="mt-2 md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-500 hover:bg-violet-400 active:bg-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Spinner size={16} />
                Creating...
              </>
            ) : (
              "Create Team"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}