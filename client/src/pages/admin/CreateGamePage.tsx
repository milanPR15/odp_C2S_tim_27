import { BackButton, PageHeader } from "../../components/ui/UI";
import { GameCreateForm } from "../../components/game_create/GameCreateForm";
import { GameCreateGuide } from "../../components/game_create/GameCreateGuide";

export default function CreateGamePage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-36 -left-20 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />

      <PageHeader eyebrow="Admin" title="Create Game" action={<BackButton fallbackTo="/games" />} />

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <GameCreateForm />
        <GameCreateGuide />
      </div>
    </div>
  );
}