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
    <div className="sticky top-32">
      <div className="flex flex-col items-center">
        {sections.map((section, index) => {
          const isActive = section.id === activeSection;
          const isCompleted = index < activeIndex;
          
          return (
            <div key={section.id} className="flex flex-col items-center">
              {/* Connector line */}
              {index > 0 && (
                <motion.div 
                  className="w-0.5 h-6"
                  initial={{ backgroundColor: 'hsl(var(--muted))' }}
                  animate={{ 
                    backgroundColor: isCompleted || isActive 
                      ? 'hsl(var(--gold))' 
                      : 'hsl(var(--muted))'
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}
              
              {/* Chakra dot */}
              <motion.button
                onClick={() => {
                  const element = document.getElementById(`section-${section.id}`);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`relative group ${isActive ? 'chakra-dot active' : isCompleted ? 'chakra-dot completed' : 'chakra-dot'}`}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                title={section.label}
              >
                {/* Pulse ring for active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-accent/30"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
              
              {/* Tooltip on hover */}
              <motion.div
                className="absolute left-8 bg-card rounded-lg px-3 py-1.5 text-xs font-medium text-foreground shadow-lg border border-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap"
                initial={{ opacity: 0, x: -5 }}
                whileHover={{ opacity: 1, x: 0 }}
              >
                {section.label}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Section label */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-center"
      >
        <p className="text-xs text-muted-foreground font-medium">
          {sections.find(s => s.id === activeSection)?.label}
        </p>
      </motion.div>
    </div>
  );
}