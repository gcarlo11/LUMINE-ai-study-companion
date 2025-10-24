"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ChatMessage from "./chat-message"
import ChatInput from "./chat-input"
import TypingIndicator from "./typing-indicator"
import { set } from "date-fns"

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
        "Hi! I am Carlo, your friendly study assistant.",
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "bot",
      content:
        "Silakan upload dokumen PDF untuk dianalisis atau ajukan pertanyaan kepada saya.",
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

  const handleSendMessage = async (text: string) => {
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

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: text }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from backend");
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.answer || "Maaf, saya tidak dapat memproses permintaan Anda saat ini.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Maaf, terjadi kesalahan saat mengirim pesan. Silakan coba lagi.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false)
    }
        
  
    // Simulate bot response
    // setTimeout(() => {
    //   const botMessage: Message = {
    //     id: (Date.now() + 1).toString(),
    //     type: "bot",
    //     content: "Terima kasih atas pertanyaan Anda. Saya sedang memproses informasi untuk memberikan jawaban terbaik.",
    //     timestamp: new Date(),
    //   }
    //   setMessages((prev) => [...prev, botMessage])
    //   setIsLoading(false)
    // }, 1500)
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
        <h1 className="text-xl font-bold text-white">AI Study Companion</h1>
        <div className="flex justify-between">
          <p className="text-sm text-[#E0AAFF]/80">Created by gcarlo11</p>
          <p className="text-sm text-[#E0AAFF]/50">Powered by Gemini</p>
        </div>
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
            className="shrink-0 w-12 h-12 rounded-lg bg-linear-to-br from-[#7B2CBF] to-[#9D4EDD] text-white font-bold text-lg hover:shadow-lg hover:shadow-[#7B2CBF]/50 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
          >
            <svg width="64px" height="64px" viewBox="-204.8 -204.8 1433.60 1433.60" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M736.68 435.86a173.773 173.773 0 0 1 172.042 172.038c0.578 44.907-18.093 87.822-48.461 119.698-32.761 34.387-76.991 51.744-123.581 52.343-68.202 0.876-68.284 106.718 0 105.841 152.654-1.964 275.918-125.229 277.883-277.883 1.964-152.664-128.188-275.956-277.883-277.879-68.284-0.878-68.202 104.965 0 105.842zM285.262 779.307A173.773 173.773 0 0 1 113.22 607.266c-0.577-44.909 18.09-87.823 48.461-119.705 32.759-34.386 76.988-51.737 123.58-52.337 68.2-0.877 68.284-106.721 0-105.842C132.605 331.344 9.341 454.607 7.379 607.266 5.417 759.929 135.565 883.225 285.262 885.148c68.284 0.876 68.2-104.965 0-105.841z" fill="#ffffff"></path>
              <path d="M339.68 384.204a173.762 173.762 0 0 1 172.037-172.038c44.908-0.577 87.822 18.092 119.698 48.462 34.388 32.759 51.743 76.985 52.343 123.576 0.877 68.199 106.72 68.284 105.843 0-1.964-152.653-125.231-275.917-277.884-277.879-152.664-1.962-275.954 128.182-277.878 277.879-0.88 68.284 104.964 68.199 105.841 0z" fill="#ffffff"></path><path d="M545.039 473.078c16.542 16.542 16.542 43.356 0 59.896l-122.89 122.895c-16.542 16.538-43.357 16.538-59.896 0-16.542-16.546-16.542-43.362 0-59.899l122.892-122.892c16.537-16.542 43.355-16.542 59.894 0z" fill="#ffffff"></path><path d="M485.17 473.078c16.537-16.539 43.354-16.539 59.892 0l122.896 122.896c16.538 16.533 16.538 43.354 0 59.896-16.541 16.538-43.361 16.538-59.898 0L485.17 532.979c-16.547-16.543-16.547-43.359 0-59.901z" fill="#ffffff"></path>
              <path d="M514.045 634.097c23.972 0 43.402 19.433 43.402 43.399v178.086c0 23.968-19.432 43.398-43.402 43.398-23.964 0-43.396-19.432-43.396-43.398V677.496c0.001-23.968 19.433-43.399 43.396-43.399z" fill="#fffff0"></path>
              </g>
            </svg>
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
