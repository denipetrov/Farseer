import { classColorVar } from '@/lib/wow/classes';
import { heroTreeIconUrl, resolveHeroTree, type HeroTreeInput } from '@/lib/wow/heroTalents';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

interface HeroTalentIconProps {
  /** Any API hero talent shape: name, id, or `{ id, name }`; null on Mythic+ characters */
  tree: HeroTreeInput;
  size?: IconSize;
}

/** A hero talent tree icon framed in its class colour. Renders nothing when unknown or absent. */
export function HeroTalentIcon({ tree, size }: HeroTalentIconProps) {
  const url = heroTreeIconUrl(tree);
  const h = resolveHeroTree(tree);
  if (!url || !h) return null;

  return <GameIcon src={url} label={h.name} size={size} borderColor={classColorVar(h.classSlug)} />;
}
