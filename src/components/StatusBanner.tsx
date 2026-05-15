
// ─────────────────────────────────────────────────────────────────────────────
// STATUS BANNER  —  Animated feedback banner shown after form submission.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";

type Status = "success" | "error" | "idle";

interface Props {
  status: Status;
}

const CONFIG = {
  success: {
    bg: "bg-green-900/50 border-green-700",
    text: "text-green-300",
    icon: " ",
    message: "Application submitted successfully!",
  },
  error: {
    bg: "bg-red-900/50 border-red-700",
    text: "text-red-300",
    icon: " ",
    message: "Please fill the mandatory fields before submitting.",
  },
  idle: null,
};

export function StatusBanner({ status }: Props) {
  const config = CONFIG[status];
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl border px-4 py-3 text-sm text-center flex items-center
                  justify-center gap-2 ${config.bg} ${config.text}`}
      role="alert"
      aria-live="polite"
    >
      <span>{config.icon}</span>
      <span>{config.message}</span>
    </motion.div>
  );
}
