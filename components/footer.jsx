import { Leaf, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer id="about" className="bg-bark py-16 text-cream/80">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between lg:gap-16">
          <div className="flex max-w-sm flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf text-ink">
                <Leaf size={18} />
              </span>
              <span className="font-display text-lg font-bold text-cream">SOLTERA</span>
            </div>
            <p className="font-accent text-sm font-medium leading-relaxed text-cream/65">
              Solar dan Termoelektrik untuk Agrikultur — wadah simpan dingin
              cerdas yang membantu petani hortikultura menekan food loss
              pascapanen melalui teknologi surya dan monitoring real-time.
            </p>
          </div>

          <div className="shrink-0 sm:w-56">
            <p className="font-display mb-4 text-sm font-semibold text-cream">Tim &amp; Kontak</p>
            <ul className="space-y-2.5 text-sm font-medium text-cream/65">
              <li>Tim SOLTERA</li>
              <li>SMA Negeri 1 Surakarta</li>
              <li className="flex items-center gap-2">
                <Mail size={14} /> soltera552@gmail.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-cream/10 pt-6 text-xs font-medium text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} SOLTERA. Dibangun untuk mendukung ketahanan pangan hortikultura.</p>
        </div>
      </div>
    </footer>
  );
}
