import { atlasAsset } from "./atlas-marks";

export function AtlasPicture({ scene, className }: { scene: "entry" | "hero"; className: string }) {
  return (
    <picture className={className}>
      <source media="(max-width: 767px)" srcSet={atlasAsset(`atlas/${scene}-mobile.webp`)} />
      {/* The two sources are pre-encoded locally for static export. */}
      <img src={atlasAsset(`atlas/${scene}.webp`)} alt="" width={1440} height={810} fetchPriority="high" />
    </picture>
  );
}
