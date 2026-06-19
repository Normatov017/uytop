import { useEffect, useState } from "react";
import { MessageCircle, Send, ArrowLeft, Home } from "lucide-react";
import { api } from "../../lib/api";
import type { Page } from "../types";
import { t } from "../../lib/i18n";

interface Conversation {
  id: number; property_id: number; property_title: string;
  other_name: string; last_message: string | null;
  last_message_at: string | null; unread_count: number;
}

interface Message {
  id: number; sender_id: number; sender_name: string;
  content: string; is_read: boolean; created_at: string;
}

export default function ChatPage({ onNav }: { onNav: (p: Page) => void }) {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number>(0);

  useEffect(() => {
    api.me().then(u => setUserId(u.id)).catch(() => {});
    api.conversations().then(d => { setConvos(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeConv) {
      api.messages(activeConv).then(setMessages).catch(() => {});
    }
  }, [activeConv]);

  const send = async () => {
    if (!input.trim() || !activeConv) return;
    await api.sendMessage(activeConv, input.trim());
    setInput("");
    const msgs = await api.messages(activeConv);
    setMessages(msgs);
    const c = await api.conversations();
    setConvos(c);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <MessageCircle size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900">{t("chat")}</h1>
        </div>

        <div className="flex gap-4 h-[calc(100vh-200px)]">
          {/* Conversation list */}
          <div className="w-72 shrink-0 bg-white rounded-2xl border border-gray-100 overflow-y-auto">
            {convos.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">
                <MessageCircle size={32} className="mx-auto mb-2 text-gray-200" />
                Hali xabarlar yo'q
              </div>
            )}
            {convos.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveConv(c.id)}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${activeConv === c.id ? "bg-green-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">{c.other_name}</div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">{c.property_title}</div>
                    {c.last_message && (
                      <div className="text-xs text-gray-500 truncate mt-1">{c.last_message}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {c.unread_count > 0 && (
                      <span className="w-5 h-5 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col">
            {!activeConv ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                <div className="text-center">
                  <MessageCircle size={40} className="mx-auto mb-2 text-gray-200" />
                  Suhbatni tanlang
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.sender_id === userId ? "bg-green-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                        <div>{m.content}</div>
                        <div className={`text-[10px] mt-1 ${m.sender_id === userId ? "text-green-200" : "text-gray-400"}`}>
                          {new Date(m.created_at).toLocaleTimeString("uz", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 p-3 flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                    placeholder="Xabar yozing..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim()}
                    className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-green-700 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
