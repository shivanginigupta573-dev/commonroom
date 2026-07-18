"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import { MessageSquare, Send, ArrowLeft, Package } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

type OtherUser = { id: number; username: string };
type ListingInfo = { id: number; title: string; image: string | null } | null;

type Conversation = {
  id: number;
  other_user: OtherUser | null;
  listing: ListingInfo;
  last_message: { text: string; timestamp: string; sender_id: number } | null;
  unread_count: number;
  updated_at: string;
};

type Message = {
  id: number;
  text: string;
  sender_id: number;
  sender_username: string;
  timestamp: string;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoOpenId = searchParams.get("conversation_id");

  const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Auth guard ─────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/auth/login"); return; }
    setCurrentUser(JSON.parse(stored));
  }, [router]);

  // ── Load sidebar ────────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get("/chat/conversations/");
      setConversations(res.data);
    } catch {/* silent */ }
  }, []);

  useEffect(() => {
    if (currentUser) loadConversations();
  }, [currentUser, loadConversations]);

  // ── Auto-open if redirected from listing page ──────────────────────────
  useEffect(() => {
    if (autoOpenId && conversations.length > 0) {
      const id = Number(autoOpenId);
      if (conversations.find((c) => c.id === id)) openConversation(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenId, conversations]);

  // ── Open a conversation: load history + connect WebSocket ──────────────
  const openConversation = useCallback(async (id: number) => {
    if (activeConvoId === id) return;

    // Close previous WebSocket
    if (wsRef.current) wsRef.current.close();

    setActiveConvoId(id);
    setLoadingMessages(true);
    setMessages([]);

    // 1. Load history via REST
    try {
      const res = await api.get(`/chat/conversations/${id}/messages/`);
      setMessages(res.data.results ?? res.data);
      // Refresh sidebar to reset unread count
      loadConversations();
    } catch {/* silent */}
    finally { setLoadingMessages(false); }

    // 2. Open WebSocket for real-time
    const token = localStorage.getItem("access_token");
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${id}/?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg: Message = JSON.parse(event.data);
      setMessages((prev) => {
        // Deduplicate — server echoes back to sender too
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    ws.onerror = (e) => console.error("WS error", e);
  }, [activeConvoId, loadConversations]);

  // ── Scroll to bottom whenever messages change ──────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ────────────────────────────────────────────────────────
  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ text }));
    setInputText("");
    inputRef.current?.focus();
  };

  const activeConvo = conversations.find((c) => c.id === activeConvoId);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-6xl w-full mx-auto flex overflow-hidden" style={{ height: "calc(100vh - 80px)" }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
          <div className="p-5 border-b border-slate-100">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Messages</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
                <MessageSquare size={40} className="text-slate-200" />
                <p className="text-sm font-semibold text-slate-400">No conversations yet.</p>
                <p className="text-xs text-slate-400">Click &quot;Contact Seller&quot; on any listing to start chatting.</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => openConversation(convo.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-slate-50 hover:bg-slate-50 transition flex items-center gap-3 ${activeConvoId === convo.id ? "bg-indigo-50 border-l-2 border-l-indigo-500" : ""}`}
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center flex-shrink-0 uppercase">
                    {convo.other_user?.username.charAt(0) ?? "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm truncate">{convo.other_user?.username ?? "Unknown"}</span>
                      {convo.last_message && (
                        <span className="text-[10px] text-slate-400 font-medium ml-2 flex-shrink-0">
                          {formatDate(convo.last_message.timestamp)}
                        </span>
                      )}
                    </div>
                    {convo.listing && (
                      <p className="text-[10px] text-indigo-500 font-semibold truncate">{convo.listing.title}</p>
                    )}
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-slate-400 truncate">{convo.last_message?.text ?? "No messages yet"}</p>
                      {convo.unread_count > 0 && (
                        <span className="ml-2 min-w-[18px] h-[18px] bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 flex-shrink-0">
                          {convo.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── CHAT WINDOW ──────────────────────────────────────────────── */}
        <main className={`flex-1 flex flex-col ${!activeConvoId ? "hidden md:flex" : "flex"}`}>
          {!activeConvoId ? (
            // Empty state
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-10">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <MessageSquare size={36} className="text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-700">Select a conversation</h2>
              <p className="text-sm text-slate-400 max-w-xs">Pick a chat from the left to start messaging.</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center gap-3 shadow-sm flex-shrink-0">
                <button onClick={() => setActiveConvoId(null)} className="md:hidden text-slate-400 hover:text-slate-700 mr-1">
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center uppercase">
                  {activeConvo?.other_user?.username.charAt(0) ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm leading-none">{activeConvo?.other_user?.username}</p>
                  {activeConvo?.listing && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Package size={11} className="text-slate-400" />
                      <p className="text-[11px] text-slate-400 truncate">{activeConvo.listing.title}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 bg-slate-50">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                    <p className="text-sm font-semibold text-slate-400">No messages yet.</p>
                    <p className="text-xs text-slate-400">Say hello! 👋</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    const showDate = i === 0 || formatDate(messages[i - 1].timestamp) !== formatDate(msg.timestamp);

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-2">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-3 py-0.5 rounded-full">
                              {formatDate(msg.timestamp)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-xs ${
                              isMe
                                ? "bg-indigo-500 text-white rounded-br-sm"
                                : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                            }`}
                          >
                            <p className="leading-relaxed">{msg.text}</p>
                            <p className={`text-[10px] mt-1 text-right ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input bar */}
              <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center gap-3 flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                  placeholder="Type a message…"
                  className="flex-1 bg-slate-100 text-slate-900 placeholder-slate-400 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 transition font-medium"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition active:scale-95"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
