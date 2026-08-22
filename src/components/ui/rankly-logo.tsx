import Image from "next/image";

/**
 * Centralized Rankly brand marks.
 * Single source of truth for paths + aspect ratios — do not reference the
 * /branding assets directly elsewhere.
 *
 * Source images are pre-cropped wordmarks on transparent background:
 * - rankly-logo.png       1613×478 (primary wordmark)
 * - rankly-by-nyxen.png   1731×515 ("by nyxen" attribution mark)
 * - rankly-mark.png       1151×1108 (square app mark)
 */

interface LogoProps {
  /** Rendered height in px. Width follows the intrinsic aspect ratio. */
  height?: number;
  className?: string;
  priority?: boolean;
}

export function RanklyLogo({ height = 16, className = "", priority = false }: LogoProps) {
  return (
    <Image
      src="/branding/rankly-logo.png"
      alt="Rankly"
      width={Math.round(height * (1613 / 478))}
      height={height}
      priority={priority}
      draggable={false}
      style={{ height: `${height}px`, width: "auto" }}
      className={`select-none ${className}`}
    />
  );
}

export function RanklyByNyxenLogo({ height = 48, className = "", priority = false }: LogoProps) {
  return (
    <Image
      src="/branding/rankly-by-nyxen.png"
      alt="Rankly — by Nyxen"
      width={Math.round(height * (1731 / 515))}
      height={height}
      priority={priority}
      draggable={false}
      style={{ height: `${height}px`, width: "auto" }}
      className={`select-none ${className}`}
    />
  );
}
