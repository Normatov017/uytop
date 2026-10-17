import { useEffect, useState, useRef } from "react";
import { MessageCircle, Send, ChevronLeft } from "lucide-react";
import { api } from "../../lib/api";
import type { Page } from "../types";
import { t } from "../../lib/i18n";
import BackButton from "../components/BackButton";

interface Conversation {
  id: number; property_id: number; property_title: string;
  other_name: string; last_message: string | null;
  last_message_at: string | null; unread_count: number;
}

interface Message {
  id: number; sender_id: number; sender_name: string;
  content: string; is_read: boolean; created_at: string;
}

const wsUrl = (() => {
  const base = import.meta.env.VITE_API_URL || "";
  if (base.startsWith("http")) {
    return base.replace(/^http/, "ws").replace(/\/api\/?$/, "/api");
  }
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${location.host}/api`;
})();

function ChatPage({ onNav, goBack }: { onNav: (p: Page) => void; goBack: () => void }) {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number>(0);
  const [showList, setShowList] = useState(true);
  const msgsEnd = useRef<HTMLDivElement>(null);

  const activeConvo = convos.find(c => c.id === activeConv);

  useEffect(() => {
    api.me().then(u => setUserId(u.id)).catch(() => {});
    api.conversations().then(d => { setConvos(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeConv) api.messages(activeConv).then(setMessages).catch(() => {});
  }, [activeConv]);

  useEffect(() => {
    if (msgsEnd.current) msgsEnd.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem(api.tokenKey);
    if (!token || !userId) return;
    const ws = new WebSocket(`${wsUrl}/ws/${userId}?token=${token}`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_message") {
          api.conversations().then(setConvos).catch(() => {});
          if (activeConv) api.messages(activeConv).then(setMessages).catch(() => {});
        }
      } catch {}
    };
    ws.onerror = () => {};
    return () => ws.close();
  }, [userId, activeConv]);

  useEffect(() => {
    if (!localStorage.getItem(api.tokenKey)) return;
    const interval = setInterval(() => {
      api.conversations().then(setConvos).catch(() => {});
      if (activeConv) api.messages(activeConv).then(setMessages).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [activeConv]);

  const send = async () => {
    if (!input.trim() || !activeConv) return;
    await api.sendMessage(activeConv, input.trim());
    setInput("");
    const [msgs, c] = await Promise.all([api.messages(activeConv), api.conversations()]);
    setMessages(msgs);
    setConvos(c);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString("uz", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("uz", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <BackButton onClick={goBack} />
        {!showList && activeConv && (
          <button onClick={() => setShowList(true)} className="p-1 -ml-2 text-gray-500 hover:text-gray-700">
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <MessageCircle size={16} className="text-white" />
          </div>
          <h1 className="text-base font-bold text-gray-900">
            {!showList && activeConvo ? activeConvo.other_name : "Xabarlar"}
          </h1>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden max-w-5xl mx-auto w-full">
        {/* Conversation list */}
        <div className={`${showList ? "flex" : "hidden md:flex"} flex-col w-full md:w-72 shrink-0 bg-white border-r border-gray-200`}>
          <div className="overflow-y-auto flex-1">
            {convos.length === 0 && (
              <div className="p-8 text-center">
                <MessageCircle size={36} className="mx-auto mb-3 text-gray-200" />
                <div className="text-sm text-gray-400">Hali xabarlar yo'q</div>
              </div>
            )}
            {convos.map(c => (
              <button
                key={c.id}
                onClick={() => { setActiveConv(c.id); setShowList(false); }}
                className={`w-full text-left p-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${activeConv === c.id ? "bg-green-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {c.other_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-sm text-gray-900 truncate">{c.other_name}</span>
                      {c.last_message_at && (
                        <span className="text-[10px] text-gray-400 shrink-0">{formatTime(c.last_message_at)}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">{c.property_title}</div>
                    {c.last_message && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">{c.last_message}</div>
                    )}
                  </div>
                  {c.unread_count > 0 && (
                    <span className="w-5 h-5 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                      {c.unread_count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className={`${!showList ? "flex" : "hidden md:flex"} flex-1 flex-col bg-white`}>
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-3 text-gray-200" />
                <div className="text-sm text-gray-400">Suhbatni tanlang</div>
              </div>
            </div>
          ) : (
            <>
              {activeConvo && (
                <div className="hidden md:flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                    {activeConvo.other_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{activeConvo.other_name}</div>
                    <div className="text-xs text-gray-400">{activeConvo.property_title}</div>
                  </div>
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"} items-end gap-2`}>
                    {m.sender_id !== userId && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {m.sender_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${m.sender_id === userId ? "bg-green-600 text-white rounded-br-md" : "bg-gray-100 text-gray-900 rounded-bl-md"}`}>
                      <div className="leading-relaxed">{m.content}</div>
                      <div className={`text-[10px] mt-0.5 ${m.sender_id === userId ? "text-green-200" : "text-gray-400"}`}>
                        {new Date(m.created_at).toLocaleTimeString("uz", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={msgsEnd} />
              </div>
              <div className="border-t border-gray-100 p-3 flex gap-2 bg-white">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && send()}
                  placeholder="Xabar yozing..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200"
                />
                <button onClick={send} disabled={!input.trim()}
                  className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-green-700 transition-colors">
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;