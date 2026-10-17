'use client';
import { motion, useScroll, useSpring } from 'framer-motion';
export default function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: .001 });
  return <motion.div aria-hidden className="no-print fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-signal to-amber" style={{ scaleX: x }} />;
}
