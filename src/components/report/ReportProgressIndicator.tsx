import { motion } from 'framer-motion';

interface Section {
  id: string;
  label: string;
}

interface ReportProgressIndicatorProps {
  sections: Section[];
  activeSection: string;
}

export function ReportProgressIndicator({ sections, activeSection }: ReportProgressIndicatorProps) {
  const activeIndex = sections.findIndex(s => s.id === activeSection);

  return (
    <nav className="sticky top-32" aria-label="Report sections">
      <ol className="relative flex flex-col gap-1">
        {sections.map((section, index) => {
          const isActive = section.id === activeSection;
          const isCompleted = index < activeIndex;

          return (
            <li key={section.id} className="flex items-center gap-3 relative">
              {/* Vertical connector */}
              {index > 0 && (
                <span
                  aria-hidden
                  className={`absolute left-[5px] -top-2 w-0.5 h-3 ${
                    isCompleted || isActive ? 'bg-accent/70' : 'bg-muted'
                  }`}
                />
              )}

              {/* Dot */}
              <motion.button
                type="button"
                onClick={() => {
                  const el = document.getElementById(`section-${section.id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className={`relative w-3 h-3 rounded-full flex-shrink-0 transition-all duration-300 ${
                  isActive
                    ? 'bg-accent shadow-[0_0_10px_hsl(var(--gold)/0.6)] scale-125'
                    : isCompleted
                    ? 'bg-accent/70'
                    : 'bg-muted hover:bg-accent/40'
                }`}
                title={section.label}
              >
                {isActive && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-accent/30"
                    animate={{ scale: [1, 1.9, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>

              {/* Label */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById(`section-${section.id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`text-xs whitespace-nowrap transition-colors text-left ${
                  isActive
                    ? 'text-accent font-semibold'
                    : isCompleted
                    ? 'text-foreground/70 hover:text-accent'
                    : 'text-muted-foreground hover:text-accent'
                }`}
              >
                {section.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
