import { BackButton, PageHeader } from "../../components/ui/UI";
import { TournamentCreateForm } from "../../components/tournament_create/TournamentCreateForm";
import { TournamentCreateGuide } from "../../components/tournament_create/TournamentCreateGuide";

export default function CreateTournamentPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-36 -left-20 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />

      <PageHeader
        eyebrow="Admin"
        title="Create Tournament"
        action={<BackButton fallbackTo="/tournaments" />}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <TournamentCreateForm />
        <TournamentCreateGuide />
      </div>
    </div>
  );
}