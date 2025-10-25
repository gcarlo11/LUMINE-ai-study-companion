"use client"

import { motion } from "framer-motion"
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.type === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`prose prose-sm max-w-xs lg:max-w-md px-4 py-1 rounded-lg prose-p:my-0.5 prose-p:py-0.5 prose-p:leading-relaxed   ${ // Pastikan  'prose prose-sm'
          isUser
            ? "bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] text-white rounded-br-none prose-invert"
            : "bg-[#2A2A2A] text-[#E0AAFF] rounded-bl-none border border-[#7B2CBF]/20 prose-invert" // 'prose-invert'  untuk background gelap
        }`}
      >

        {/* <p className="text-sm leading-relaxed"></p> */}
        <div className="text-[12px]">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        
        <p className={`text-[10px] mt-0 ${isUser ? "text-[#E0AAFF]/60" : "text-[#7B2CBF]/60"}`}>
          {message.timestamp.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  )
}
