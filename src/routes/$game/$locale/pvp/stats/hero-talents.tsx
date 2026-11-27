import { createFileRoute } from '@tanstack/react-router';
import { HeroTalentsPage } from '@/components/pvp/HeroTalentsPage';
import { validateHeroTalentStatsSearch } from '@/lib/heroTalentStats';

/** PvP Stats → Hero Talents (`?bracket&region&top&class&spec&role`) */
export const Route = createFileRoute('/$game/$locale/pvp/stats/hero-talents')({
  validateSearch: validateHeroTalentStatsSearch,
  component: function Page() {
    return <HeroTalentsPage search={Route.useSearch()} />;
  },
});
