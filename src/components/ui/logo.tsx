// import Link from "next/link";
// import { Zap } from "lucide-react";
// import { siteConfig } from "@/config/site";
// import { cn } from "@/lib/utils";

// export function Logo({
//   light = false,
//   className,
// }: {
//   light?: boolean;
//   className?: string;
// }) {
//   return (
//     <Link href="/" className={cn("flex items-center gap-2", className)}>
//       <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
//         <Zap className="size-5" fill="currentColor" />
//       </span>
//       <span
//         className={cn(
//           "text-lg font-extrabold tracking-tight",
//           light ? "text-white" : "text-slate-900 dark:text-white"
//         )}
//       >
//         {siteConfig.brand}
//       </span>
//     </Link>
//   );
// }


import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({
  light = false,
  className,
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("flex shrink-0 items-center", className)}>
      <Image
        src="/image.png"
        alt={siteConfig.brand}
        width={1421}
        height={1107}
        priority
        className={cn(
          "h-11 w-auto object-contain",
          // dark background (sidebar, footer) par halka glow taaki logo ubhar ke dikhe
          light && "drop-shadow-[0_0_6px_rgba(255,255,255,0.25)]"
        )}
      />
      <span className="sr-only">{siteConfig.brand}</span>
    </Link>
  );
}