/**
 * Route-level fade transition — subtle on trading pages, per motion kit.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

import { pageVariants } from "../variants";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-1 flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
