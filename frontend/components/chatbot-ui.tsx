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
        "Hi! I am **Lumine**, your friendly study assistant👋😄",
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "bot",
      content:
        "Please upload your **PDF document** or **notes** for study then ask me any question.",
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
        // content: `File processed successfully! Dokumen telah dianalisis dengan ${data.chunks || 0} chunks. ${data.analysis ? "Hasil analisis tersedia." : ""}`,
        content: `File processed **successfully**! You can now ask me questions related to the document.`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: "Sorry, there was an issue on proccessing document. **Please try again.**",
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
        content: data.answer || "Sorry, I couldn't procced your request right now.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Sorry, there was an issue on sending your message. **Please try again.**",
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
      className="flex flex-col h-[640px] bg-linear-to-b from-[#1a1a2e] to-[#121212] rounded-2xl border border-[#7B2CBF]/30 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-linear-to-r from-[#7B2CBF] to-[#9D4EDD] px-6 py-4 border-b border-[#7B2CBF]/50">
        <h1 className="text-3xl font-bold text-white my-1 flex items-center gap-0.5">
          <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" strokeWidth="0.00024000000000000003">
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
          <g id="SVGRepo_iconCarrier"> 
            <path d="M10 12C10 12.5523 9.55228 13 9 13C8.44772 13 8 12.5523 8 12C8 11.4477 8.44772 11 9 11C9.55228 11 10 11.4477 10 12Z" fill="#ffffff"></path> 
            <path d="M15 13C15.5523 13 16 12.5523 16 12C16 11.4477 15.5523 11 15 11C14.4477 11 14 11.4477 14 12C14 12.5523 14.4477 13 15 13Z" fill="#ffffff"></path> 
            <path fillRule="evenodd" clipRule="evenodd" d="M12.0244 2.00003L12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.74235 17.9425 2.43237 12.788 2.03059L12.7886 2.0282C12.5329 2.00891 12.278 1.99961 12.0244 2.00003ZM12 20C16.4183 20 20 16.4183 20 12C20 11.3014 19.9105 10.6237 19.7422 9.97775C16.1597 10.2313 12.7359 8.52461 10.7605 5.60246C9.31322 7.07886 7.2982 7.99666 5.06879 8.00253C4.38902 9.17866 4 10.5439 4 12C4 16.4183 7.58172 20 12 20ZM11.9785 4.00003L12.0236 4.00003L12 4L11.9785 4.00003Z" 
            fill="#ffffff"></path>
            </g>
          </svg>
          Study with Lumine
        </h1>

        <div className="flex justify-between mt-1">
          <p className="text-sm text-[#E0AAFF]/80"> Empowering Every Learner with AI.</p>
          <p className="text-[11px] text-[#E0AAFF]/60">by github.com/gcarlo11</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-[#9D4EDD]/5 hover:scrollbar-thumb-[#C77DFF]/30 scrollbar-track-transparent">
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
            <svg viewBox="-4.8 -4.8 33.60 33.60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier"> 
              <path d="M12 10.4V20M12 10.4C12 8.15979 12 7.03969 11.564 6.18404C11.1805 5.43139 10.5686 4.81947 9.81596 4.43597C8.96031 4 7.84021 4 5.6 4H4.6C4.03995 4 3.75992 4 3.54601 4.10899C3.35785 4.20487 3.20487 4.35785 3.10899 4.54601C3 4.75992 3 5.03995 3 5.6V16.4C3 16.9601 3 17.2401 3.10899 17.454C3.20487 17.6422 3.35785 17.7951 3.54601 17.891C3.75992 18 4.03995 18 4.6 18H7.54668C8.08687 18 8.35696 18 8.61814 18.0466C8.84995 18.0879 9.0761 18.1563 9.29191 18.2506C9.53504 18.3567 9.75977 18.5065 10.2092 18.8062L12 20M12 10.4C12 8.15979 12 7.03969 12.436 6.18404C12.8195 5.43139 13.4314 4.81947 14.184 4.43597C15.0397 4 16.1598 4 18.4 4H19.4C19.9601 4 20.2401 4 20.454 4.10899C20.6422 4.20487 20.7951 4.35785 20.891 4.54601C21 4.75992 21 5.03995 21 5.6V16.4C21 16.9601 21 17.2401 20.891 17.454C20.7951 17.6422 20.6422 17.7951 20.454 17.891C20.2401 18 19.9601 18 19.4 18H16.4533C15.9131 18 15.643 18 15.3819 18.0466C15.15 18.0879 14.9239 18.1563 14.7081 18.2506C14.465 18.3567 14.2402 18.5065 13.7908 18.8062L12 20" stroke="#f7f7f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path> 
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
          <p className="text-[12px] font-mono text-"> ☑️ Your document has been successfully analyzed</p>
          {/* <p>Chunks: {analysisData.chunks}</p> */}

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
