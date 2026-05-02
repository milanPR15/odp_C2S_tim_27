import type { ChangeEvent } from "react";

type DropdownProps<T extends string> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T | "all"; label: string }[];
  allLabel?: string;
};

export function TournamentFilterDropdown<T extends string>({
  label,
  value,
  onChange,
  options,
  allLabel = "All options",
}: DropdownProps<T>) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as T);
  };

  return (
    <label className="flex flex-col gap-1.5 group">
      <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 group-focus-within:text-cyan-300/80 transition-colors ml-1">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          className="w-full h-11 appearance-none rounded-xl border border-white/10 bg-black/40 px-4 pr-10 text-sm text-white/90 outline-none transition-all hover:border-cyan-500/30 hover:bg-black/60 focus:border-cyan-500/50 focus:bg-black/80 focus:ring-4 focus:ring-cyan-500/10 cursor-pointer"
        >
          <option value="all" className="bg-[#0f141a] text-white">
            {allLabel}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0f141a] text-white">
              {opt.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-white/40 group-hover:text-cyan-400 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </label>
  );
}
