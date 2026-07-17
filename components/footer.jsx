import { Leaf, Github, Mail, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer id="about" className="bg-bark py-16 text-cream/80">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf text-ink">
                <Leaf size={18} />
              </span>
              <span className="font-display text-lg font-bold text-cream">SOLTERA</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-cream/55">
              Solar dan Termoelektrik untuk Agrikultur — wadah simpan dingin
              cerdas yang membantu petani hortikultura menekan food loss
              pascapanen melalui teknologi surya dan monitoring real-time.
            </p>
          </div>

          <div>
            <p className="font-display mb-4 text-sm font-semibold text-cream">Tim &amp; Kontak</p>
            <ul className="space-y-2.5 text-sm text-cream/55">
              <li>Tim Riset SOLTERA</li>
              <li>Program Studi Teknik / Pertanian</li>
              <li className="flex items-center gap-2">
                <Mail size={14} /> soltera.project@gmail.com
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display mb-4 text-sm font-semibold text-cream">Tautan</p>
            <ul className="space-y-2.5 text-sm text-cream/55">
              <li>
                <a href="#documentation" className="hover:text-cream">Documentation</a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-cream"
                >
                  <Github size={14} /> GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-cream"
                >
                  <Instagram size={14} /> Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-cream/10 pt-6 text-xs text-cream/40 sm:flex-row">
          <p>© {new Date().getFullYear()} SOLTERA. Dibangun untuk mendukung ketahanan pangan hortikultura.</p>
          <p>Dibuat dengan Next.js, Firebase &amp; sinar matahari.</p>
        </div>
      </div>
    </footer>
  );
}
