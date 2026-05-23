import { BackButton, PageHeader } from "../../components/ui/UI";
import { TeamCreateForm } from "../../components/team_create/TeamCreateForm";
import { TeamCreateGuide } from "../../components/team_create/TeamCreateGuide";

export default function CreateTeamPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-36 -left-20 h-56 w-56 rounded-full bg-fuchsia-400/10 blur-3xl" />

      <PageHeader eyebrow="Teams" title="Create Team" action={<BackButton fallbackTo="/teams" />} />

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <TeamCreateForm />
        <TeamCreateGuide />
      </div>
    </div>
  );
}