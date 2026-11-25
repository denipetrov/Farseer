import { heroTreeIconUrl, resolveHeroTree, type HeroTreeInput } from '@/lib/wow/heroTalents';
import { useI18n } from '@/i18n/useI18n';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

interface HeroTalentIconProps {
  /** Any API hero talent shape: name, id, or `{ id, name }`; null on Mythic+ characters */
  tree: HeroTreeInput;
  size?: IconSize;
}

/** A round hero talent tree icon (its rim is in the class colour). Renders nothing when unknown or absent. */
export function HeroTalentIcon({ tree, size }: HeroTalentIconProps) {
  const { name } = useI18n();
  const url = heroTreeIconUrl(tree);
  const h = resolveHeroTree(tree);
  if (!url || !h) return null;

  return <GameIcon src={url} label={name('heroTalents', h.id, h.name)} size={size} shape="round" />;
}
