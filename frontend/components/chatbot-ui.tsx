"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ChatMessage from "./chat-message"
import ChatInput from "./chat-input"
import TypingIndicator from "./typing-indicator"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

interface AnalysisData {
  chunks?: number
  analysis?: Record<string, unknown>
  message?: string
}

export default function ChatbotUI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Halo! Saya adalah AI Assistant Anda. Silakan upload dokumen PDF untuk dianalisis atau ajukan pertanyaan kepada saya.",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes("pdf")) {
      alert("Silakan upload file PDF")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data: AnalysisData = await response.json()
      setAnalysisData(data)

      // Add bot response
      const botMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: `File processed successfully! Dokumen telah dianalisis dengan ${data.chunks || 0} chunks. ${data.analysis ? "Hasil analisis tersedia." : ""}`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: "Maaf, terjadi kesalahan saat memproses file. Silakan coba lagi.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Terima kasih atas pertanyaan Anda. Saya sedang memproses informasi untuk memberikan jawaban terbaik.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-[600px] bg-gradient-to-b from-[#1a1a2e] to-[#121212] rounded-2xl border border-[#7B2CBF]/30 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] px-6 py-4 border-b border-[#7B2CBF]/50">
        <h1 className="text-xl font-bold text-white">AI Assistant</h1>
        <p className="text-sm text-[#E0AAFF]/80">Powered by Advanced AI</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-[#7B2CBF] scrollbar-track-[#2A2A2A]">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <TypingIndicator />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[#7B2CBF]/30 bg-[#121212] p-4">
        <div className="flex gap-3">
          {/* Upload Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-[#7B2CBF] to-[#9D4EDD] text-white font-bold text-lg hover:shadow-lg hover:shadow-[#7B2CBF]/50 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
          >
            📄
          </motion.button>

          {/* Chat Input */}
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Analysis Data Display */}
      {analysisData && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-[#7B2CBF]/30 bg-[#1a1a2e] px-6 py-3 text-sm text-[#E0AAFF]"
        >
          <p className="font-semibold mb-2">📊 Analysis Results:</p>
          <p>Chunks: {analysisData.chunks}</p>
          {analysisData.analysis && (
            <pre className="text-xs mt-2 overflow-auto max-h-20 text-[#9D4EDD]">
              {JSON.stringify(analysisData.analysis, null, 2)}
            </pre>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
