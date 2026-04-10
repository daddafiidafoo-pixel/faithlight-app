import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function AIBibleAssistant() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: "intro",
      role: "assistant",
      content:
        "Hello! I'm your AI Bible Assistant. Ask me anything about Bible passages, theological concepts, or historical context. I'm here to help you understand Scripture better.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful Bible study assistant. The user is asking about Scripture, theology, or Bible history. Provide clear, easy-to-understand explanations suitable for daily Bible study.

User question: ${input}

Provide:
1. Direct answer to their question
2. Relevant Bible passages if applicable
3. Practical application for daily life
4. Follow-up resources or related topics

Keep your response concise and accessible.`,
        model: "gemini_3_flash",
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <h1 className="text-2xl font-bold text-slate-900">
              Bible Assistant
            </h1>
          </div>
          <p className="text-sm text-slate-600">
            Ask questions about Scripture, theology, and Bible history
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-900 border border-slate-200"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-100" />
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-6 py-4">
        <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ask about a verse, concept, or Bible topic..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-full"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}