"use client";

import React, { useEffect, useMemo, useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronRight, Newspaper, Info, FileText, MessageSquare, Clock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChildSwitcher from "@/components/ChildSwitcher";
import { useAuth } from "@/auth/AuthContext";
import { USE_PHP_API } from "@/services/appMode";
import { fetchInfoNotes, fetchNews, fetchRequests, PhpInfoNote, PhpNews, PhpRequestItem } from "@/services/phpApi";
import { ensureSelectedStudentId, setSelectedStudentId } from "@/services/selectionStore";
import { mockBackend } from "@/services/mockBackend";

const MOCK_CHILDREN = [
  { id: "1", name: "Lucas", class: "CE2/D", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas" },
  { id: "2", name: "Emma", class: "CM2/E", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
];

function formatDate(dateTime: string | null | undefined) {
  if (!dateTime) return "";
  return String(dateTime).split(" ")[0];
}

const Index = () => {
  const navigate = useNavigate();
  const { parent, students } = useAuth();

  // --- API Mode ---
  const [apiNotes, setApiNotes] = useState<PhpInfoNote[]>([]);
  const [apiNews, setApiNews] = useState<PhpNews[]>([]);
  const [apiRequests, setApiRequests] = useState<PhpRequestItem[]>([]);

  // --- Simulation Mode ---
  const [notes, setNotes] = useState(mockBackend.getNotes());
  const [news, setNews] = useState(mockBackend.getNews());
  const [requests, setRequests] = useState(mockBackend.getRequests());

  const childrenList = useMemo(() => {
    if (!USE_PHP_API) return MOCK_CHILDREN;

    return (students ?? []).map((s) => ({
      id: String(s.id),
      name: `${s.first_name}`,
      class: `${s.level_code} ${s.class_code}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(`${s.first_name}-${s.last_name}`)}`,
    }));
  }, [students]);

  const [selectedChildId, setSelectedChildIdState] = useState<string>(childrenList[0]?.id ?? "");

  // Keep selected student persisted (API mode)
  useEffect(() => {
    if (!USE_PHP_API) return;
    const sid = ensureSelectedStudentId(students as any);
    if (sid) setSelectedChildIdState(String(sid));
  }, [students]);

  const selectedStudentId = USE_PHP_API ? Number(selectedChildId || 0) : selectedChildId;

  useEffect(() => {
    if (!USE_PHP_API) {
      setNotes(mockBackend.getNotes());
      setNews(mockBackend.getNews());
      setRequests(mockBackend.getRequests());
      return;
    }

    (async () => {
      try {
        const [n1, n2, n3] = await Promise.all([fetchInfoNotes(), fetchNews(), fetchRequests()]);
        setApiNotes(n1);
        setApiNews(n2);
        setApiRequests(n3);
      } catch {
        // Les pages dédiées afficheront aussi leur état; ici on reste silencieux.
      }
    })();
  }, []);

  const unreadNotes = USE_PHP_API
    ? apiNotes.filter((n) => !n.is_read).length
    : notes.filter((n) => !n.is_read).length;

  const unreadNews = USE_PHP_API
    ? apiNews.filter((n) => !n.is_read).length
    : news.filter((n) => !n.is_read).length;

  const pendingRequests = USE_PHP_API
    ? apiRequests.filter((r) => String(r.status).toLowerCase() === "pending").length
    : requests.filter((r) => r.status === "pending").length;

  const lastInfoNote = USE_PHP_API ? apiNotes[0] : notes[0];
  const lastNews = USE_PHP_API ? apiNews[0] : news[0];
  const lastRequest = USE_PHP_API ? apiRequests[0] : requests[0];

  const onSelectChild = (id: string) => {
    setSelectedChildIdState(id);
    if (USE_PHP_API) {
      const n = Number(id);
      if (Number.isFinite(n) && n > 0) setSelectedStudentId(n);
    }
  };

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bonjour{parent ? `, ${parent.first_name}` : ", M. Martin"}
            </h1>
            <p className="text-slate-500 text-sm">Institution AL HANANE</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/sim")}
              className="p-2 bg-indigo-50 rounded-full border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-colors"
              title="Simulation Hub"
            >
              <ShieldCheck size={20} />
            </button>
            <button className="p-2 bg-white rounded-full shadow-sm border border-slate-100 relative">
              <Bell size={20} className="text-slate-600" />
              {(unreadNotes > 0 || unreadNews > 0) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </div>

        {/* Child Switcher */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mes Enfants</h2>
          <ChildSwitcher childrenList={childrenList} selectedChildId={selectedChildId} onSelect={onSelectChild} />
        </div>

        {/* Unread Indicators */}
        <div className="grid grid-cols-3 gap-3">
          <Card
            className="bg-indigo-200 border border-indigo-300 shadow-sm cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate("/info")}
          >
            <CardContent className="p-3 space-y-2">
              <div className="bg-white/90 text-indigo-700 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">
                <Info size={16} />
              </div>
              <div>
                <p className="text-[8px] text-indigo-950 font-bold uppercase">Notes d'info</p>
                <p className="text-lg font-extrabold text-indigo-900">{unreadNotes}</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="bg-indigo-200 border border-indigo-300 shadow-sm cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate("/news")}
          >
            <CardContent className="p-3 space-y-2">
              <div className="bg-white/90 text-amber-600 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">
                <Newspaper size={16} />
              </div>
              <div>
                <p className="text-[8px] text-indigo-950 font-bold uppercase">Actualités</p>
                <p className="text-lg font-extrabold text-indigo-900">{unreadNews}</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="bg-indigo-200 border border-indigo-300 shadow-sm cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate("/messages")}
          >
            <CardContent className="p-3 space-y-2">
              <div className="bg-white/90 text-emerald-600 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-[8px] text-indigo-950 font-bold uppercase">Demandes</p>
                <p className="text-lg font-extrabold text-indigo-900">{pendingRequests}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Updates */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Dernières publications</h2>

          <div className="space-y-3">
            {lastInfoNote && (
              <button
                onClick={() => navigate("/info")}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors">
                  <FileText size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <Badge className="bg-indigo-100 text-indigo-700 border-none text-[9px] font-bold uppercase">Note d'info</Badge>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatDate((lastInfoNote as any).published_at)}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{(lastInfoNote as any).title}</h3>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            )}

            {lastNews && (
              <button
                onClick={() => navigate("/news")}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="bg-amber-50 text-amber-500 p-3 rounded-xl group-hover:bg-amber-100 transition-colors">
                  <Newspaper size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <Badge className="bg-amber-100 text-amber-700 border-none text-[9px] font-bold uppercase">Actualité</Badge>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatDate((lastNews as any).published_at)}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{(lastNews as any).title}</h3>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            )}

            {lastRequest && (
              <button
                onClick={() => navigate("/messages")}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl group-hover:bg-emerald-100 transition-colors">
                  <MessageSquare size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-bold uppercase">Ma demande</Badge>
                    <Badge
                      variant="outline"
                      className={`text-[9px] ${
                        String((lastRequest as any).status).toLowerCase() === "pending"
                          ? "border-amber-200 text-amber-600 bg-amber-50"
                          : "border-emerald-200 text-emerald-600 bg-emerald-50"
                      }`}
                    >
                      {String((lastRequest as any).status).toLowerCase() === "pending" ? "En attente" : "Terminée"}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{(lastRequest as any).type}</h3>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Index;