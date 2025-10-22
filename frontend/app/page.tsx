'use client'; // Diperlukan untuk menggunakan hooks seperti useState

import Image from "next/image";
import { useState } from "react";
import axios from "axios"; // Pastikan axios terinstal (ada di package.json Anda)

// Definisikan tipe untuk pesan agar lebih terstruktur
interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Panggil backend API Anda (sesuai prefix di main.py)
      const response = await axios.post('http://localhost:8000/api/ask', {
        question: input
      });

      let botMessage: Message;
      if (response.data.answer) {
        botMessage = { sender: 'bot', text: response.data.answer };
      } else {
        botMessage = { sender: 'bot', text: "Maaf, terjadi kesalahan." };
      }
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage: Message = { sender: 'bot', text: "Gagal terhubung ke server." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <header className="text-center p-4 border-b">
        <h1 className="text-2xl font-bold">Adaptive Study Companion</h1>
      </header>

      {/* Area Chat */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg px-4 py-2 bg-gray-200 text-gray-800">
              Mengetik...
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          className="flex-1 border rounded-full px-4 py-2 text-black" // Pastikan input terlihat
          placeholder="Ketik pertanyaan Anda..."
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-blue-600 text-white rounded-full px-6 py-2 font-semibold disabled:bg-gray-400"
        >
          Kirim
        </button>
      </footer>
    </div>
  );
}