"use client";

import React, { useEffect, useMemo, useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, FileText, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { USE_PHP_API } from "@/services/appMode";
import { fetchInfoNotes, markInfoNoteRead, PhpInfoNote } from "@/services/phpApi";
import { showSuccess } from "@/utils/toast";
import { mockBackend, MockInfoNote } from "@/services/mockBackend";

function getDate(dt: string) {
  return dt.split(" ")[0] ?? dt;
}

const InfoNotes = () => {
  const navigate = useNavigate();

  const [apiNotes, setApiNotes] = useState<PhpInfoNote[]>([]);
  const [notes, setNotes] = useState<MockInfoNote[]>(mockBackend.getNotes());

  useEffect(() => {
    if (!USE_PHP_API) {
      setNotes(mockBackend.getNotes());
      return;
    }

    (async () => {
      const items = await fetchInfoNotes();
      setApiNotes(items);
    })();
  }, []);

  const items = USE_PHP_API ? apiNotes : notes;

  const handleMarkRead = async (id: number) => {
    if (!USE_PHP_API) {
      mockBackend.markNoteRead(id);
      setNotes(mockBackend.getNotes());
      return;
    }

    await markInfoNoteRead(id);
    showSuccess("Marqué comme lu");
    const refreshed = await fetchInfoNotes();
    setApiNotes(refreshed);
  };

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        <header className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notes d'information</h1>
            <p className="text-slate-500 text-sm">Documents et notes administratives</p>
          </div>
        </header>

        <div className="space-y-6">
          {items.map((note: any) => (
            <Card key={note.id} className={`border-none shadow-md bg-white overflow-hidden group ${note.is_read ? "opacity-75" : ""}`}>
              <div className="relative h-48 overflow-hidden">
                <img
                  src={note.image_url || "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800"}
                  alt={note.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-indigo-600 border-none font-bold">
                  Administratif
                </Badge>
                {note.is_read && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <Calendar size={14} />
                    {getDate(note.published_at)}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">{note.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{note.description}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleMarkRead(note.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-colors ${note.is_read ? "bg-slate-100 text-slate-400" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                  >
                    <FileText size={16} />
                    {note.is_read ? "Déjà lu" : note.pdf_url ? "Consulter PDF" : "Marquer comme lu"}
                  </button>

                  {note.link_url && (
                    <a
                      href={note.link_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-50 text-slate-700 hover:bg-slate-100"
                    >
                      <ExternalLink size={16} />
                      Ouvrir
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {items.length === 0 && (
            <div className="text-center text-sm text-slate-500 py-12">Aucune note pour le moment.</div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default InfoNotes;