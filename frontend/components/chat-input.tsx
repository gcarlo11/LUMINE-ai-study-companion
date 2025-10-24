"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
      <motion.input
        whileFocus={{ boxShadow: "0 0 20px rgba(123, 44, 191, 0.5)" }}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder="Ketik pesan Anda..."
        className="flex-1 px-4 py-3 rounded-lg bg-[#2A2A2A] text-white placeholder-[#7B2CBF]/50 border border-[#7B2CBF]/30 focus:border-[#7B2CBF] focus:outline-none transition-all duration-200 disabled:opacity-50"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={disabled || !input.trim()}
        className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] text-white font-semibold hover:shadow-lg hover:shadow-[#7B2CBF]/50 disabled:opacity-50 transition-all duration-200"
      >
        Send
      </motion.button>
    </form>
  )
}
