"use client"

import { motion } from "framer-motion"

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start"
    >
      <div className="bg-[#2A2A2A] text-[#E0AAFF] px-4 py-3 rounded-lg border border-[#7B2CBF]/20 rounded-bl-none">
        <div className="flex gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-[#7B2CBF] typing-dot"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-[#7B2CBF] typing-dot"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-[#7B2CBF] typing-dot"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  )
}
