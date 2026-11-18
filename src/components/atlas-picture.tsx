import { atlasAsset } from "./atlas-marks";

export function AtlasPicture({ scene, className }: { scene: "entry" | "hero"; className: string }) {
  return (
    <picture aria-hidden="true" className={className}>
      <source media="(max-width: 767px)" srcSet={atlasAsset(`atlas/${scene}-mobile.webp`)} />
      {/* The two sources are pre-encoded locally for static export. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={atlasAsset(`atlas/${scene}.webp`)} alt="" width={1440} height={810} fetchPriority="high" />
    </picture>
  );
}
