"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePatient } from "@/lib/hooks/usePatient";
import { AGENT_LABELS, type AgentType } from "@/lib/openai/chat-router";
import type { ChatMessage } from "@/lib/types/database";

function AgentBadge({ agentType }: { agentType: AgentType }) {
  const agent = AGENT_LABELS[agentType];
  return (
    <span className="text-[9px] text-gold-dim">
      {agent.icon} {agent.name}
    </span>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isPatient = msg.role === "patient";
  const agentType = msg.metadata?.agent_type as AgentType | undefined;

  return (
    <div className={`flex ${isPatient ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isPatient
            ? "bg-gold text-black rounded-br-md"
            : msg.is_escalated
              ? "bg-danger-bg border border-danger-border text-text rounded-bl-md"
              : "bg-bg-card border border-[#1a1a1a] text-text rounded-bl-md"
        }`}
      >
        {!isPatient && agentType && (
          <div className="mb-1">
            <AgentBadge agentType={agentType} />
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
        <p className={`text-[9px] mt-1 ${isPatient ? "text-black/50" : "text-text-muted"}`}>
          {new Date(msg.created_at).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { intervention } = usePatient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingAgent, setStreamingAgent] = useState<AgentType | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load history
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/patient/chat");
      if (res.ok) setMessages(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  useEffect(scrollToBottom, [messages, streamingContent, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);
    setStreamingContent("");
    setStreamingAgent(null);

    // Optimistic: add patient message
    const tempMsg: ChatMessage = {
      id: crypto.randomUUID(),
      intervention_id: intervention?.id || "",
      role: "patient",
      content: userMessage,
      metadata: {},
      staff_user_id: null,
      day_offset: intervention?.current_day || 0,
      is_escalated: false,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/patient/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Error en la respuesta");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let agent: AgentType | null = null;
      let escalated = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.agent) {
              agent = data.agent;
              escalated = data.escalated || false;
              setStreamingAgent(agent);
            }

            if (data.content) {
              fullContent += data.content;
              setStreamingContent(fullContent);
            }

            if (data.done) {
              // Add final AI message
              const aiMsg: ChatMessage = {
                id: crypto.randomUUID(),
                intervention_id: intervention?.id || "",
                role: "ai_agent",
                content: fullContent,
                metadata: { agent_type: agent || undefined },
                staff_user_id: null,
                day_offset: intervention?.current_day || 0,
                is_escalated: escalated,
                read_at: null,
                created_at: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, aiMsg]);
              setStreamingContent("");
              setStreamingAgent(null);
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        intervention_id: intervention?.id || "",
        role: "ai_agent",
        content: "Lo siento, ha ocurrido un error. Intentalo de nuevo o contacta con la clinica.",
        metadata: {},
        staff_user_id: null,
        day_offset: intervention?.current_day || 0,
        is_escalated: false,
        read_at: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setStreamingContent("");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!intervention) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-lg mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">💬</span>
            <p className="text-text-muted text-sm mb-1">Hola {intervention.first_name}!</p>
            <p className="text-text-muted text-xs">
              Preguntame lo que necesites sobre tu trasplante capilar.
              <br />
              Tengo 3 expertos a tu disposicion 24/7.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {(Object.entries(AGENT_LABELS) as [AgentType, { name: string; icon: string }][]).map(
                ([, agent]) => (
                  <span
                    key={agent.name}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-bg-card border border-[#222] text-text-muted"
                  >
                    {agent.icon} {agent.name}
                  </span>
                )
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[
                "¿Es normal el picor?",
                "¿Puedo hacer deporte?",
                "Tengo ansiedad por el shedding",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-gold-border text-gold
                    hover:bg-gold-subtle transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Streaming indicator */}
        {streamingContent && (
          <div className="flex justify-start mb-3">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-2.5 bg-bg-card border border-[#1a1a1a]">
              {streamingAgent && (
                <div className="mb-1">
                  <AgentBadge agentType={streamingAgent} />
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed text-text">
                {streamingContent}
                <span className="inline-block w-1.5 h-4 bg-gold ml-0.5 animate-pulse" />
              </p>
            </div>
          </div>
        )}

        {sending && !streamingContent && (
          <div className="flex justify-start mb-3">
            <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-bg-card border border-[#1a1a1a]">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-black border-t border-[#1a1a1a]">
        <div className="flex gap-2 items-end max-w-lg mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta..."
            rows={1}
            disabled={sending}
            className="flex-1 bg-bg-card border border-[#222] rounded-xl px-4 py-2.5 text-sm
              text-text placeholder-text-muted resize-none focus:border-gold-border
              focus:outline-none focus:ring-1 focus:ring-gold/30 disabled:opacity-40
              max-h-24 overflow-y-auto"
            style={{ minHeight: "42px" }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="w-10 h-10 rounded-xl bg-gold text-black flex items-center justify-center
              hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <span className="text-lg">↑</span>
          </button>
        </div>
      </div>
    </div>
  );
}
