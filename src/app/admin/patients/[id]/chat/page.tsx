"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { AGENT_LABELS, type AgentType } from "@/lib/openai/chat-router";
import type { ChatMessage } from "@/lib/types/database";

export default function AdminChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/patients/${id}/chat`);
      if (res.ok) setMessages(await res.json());
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendReply = async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    const res = await fetch(`/api/admin/patients/${id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    });

    if (res.ok) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          intervention_id: id,
          role: "staff",
          content: input.trim(),
          metadata: {},
          staff_user_id: null,
          day_offset: null,
          is_escalated: false,
          read_at: null,
          created_at: new Date().toISOString(),
        },
      ]);
      setInput("");
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-[#1a1a1a] bg-black flex items-center gap-3">
        <Link href={`/admin/patients/${id}`} className="text-text-muted hover:text-gold text-sm">←</Link>
        <div>
          <h1 className="text-gold text-xs uppercase tracking-[3px] font-light">Chat del paciente</h1>
          <p className="text-text-muted text-[10px]">{messages.length} mensajes</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-bg">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {messages.map((msg) => {
          const agentType = msg.metadata?.agent_type as AgentType | undefined;
          const agent = agentType ? AGENT_LABELS[agentType] : null;

          return (
            <div key={msg.id} className={`mb-3 flex ${msg.role === "patient" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.role === "patient"
                    ? "bg-gold text-black rounded-br-md"
                    : msg.role === "staff"
                      ? "bg-blue-bg border border-blue-border text-text rounded-bl-md"
                      : msg.is_escalated
                        ? "bg-danger-bg border border-danger-border text-text rounded-bl-md"
                        : "bg-bg-card border border-[#1a1a1a] text-text rounded-bl-md"
                }`}
              >
                {/* Role label */}
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[9px] font-semibold uppercase tracking-wider ${
                    msg.role === "patient" ? "text-black/50"
                    : msg.role === "staff" ? "text-blue"
                    : msg.is_escalated ? "text-danger"
                    : "text-gold-dim"
                  }`}>
                    {msg.role === "patient" ? "Paciente"
                     : msg.role === "staff" ? "Equipo Capilex"
                     : agent ? `${agent.icon} ${agent.name}` : "IA"}
                  </span>
                  {msg.is_escalated && <span className="text-[9px] text-danger font-bold">ESCALADO</span>}
                </div>

                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p className={`text-[9px] mt-1 ${msg.role === "patient" ? "text-black/40" : "text-text-muted"}`}>
                  {msg.day_offset !== null && `Dia ${msg.day_offset} · `}
                  {new Date(msg.created_at).toLocaleString("es-ES", {
                    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Reply input */}
      <div className="p-4 bg-black border-t border-[#1a1a1a]">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
            placeholder="Responder como equipo clinico..."
            rows={1}
            className="flex-1 bg-bg-card border border-[#222] rounded-xl px-4 py-2.5 text-sm text-text-white
              placeholder-text-muted resize-none focus:border-gold-border focus:outline-none max-h-24"
          />
          <button
            onClick={sendReply}
            disabled={sending || !input.trim()}
            className="px-4 py-2.5 bg-gold text-black rounded-xl font-semibold text-sm
              hover:opacity-90 disabled:opacity-30 flex-shrink-0"
          >
            {sending ? "..." : "Enviar"}
          </button>
        </div>
        <p className="text-text-muted text-[10px] mt-1 text-center">
          El paciente vera tu mensaje como "Equipo Capilex"
        </p>
      </div>
    </div>
  );
}
