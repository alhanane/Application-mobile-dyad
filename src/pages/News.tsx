"use client";

import React, { useEffect, useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { USE_PHP_API } from "@/services/appMode";
import { fetchNews, markNewsRead, PhpNews } from "@/services/phpApi";
import { showSuccess } from "@/utils/toast";
import { mockBackend, MockNews } from "@/services/mockBackend";

function getDate(dt: string) {
  return dt.split(" ")[0] ?? dt;
}

const News = () => {
  const navigate = useNavigate();

  const [apiNews, setApiNews] = useState<PhpNews[]>([]);
  const [news, setNews] = useState<MockNews[]>(mockBackend.getNews());

  useEffect(() => {
    if (!USE_PHP_API) {
      setNews(mockBackend.getNews());
      return;
    }

    (async () => {
      const items = await fetchNews();
      setApiNews(items);
    })();
  }, []);

  const items = USE_PHP_API ? apiNews : news;

  const handleMarkRead = async (id: number) => {
    if (!USE_PHP_API) {
      mockBackend.markNewsRead(id);
      setNews(mockBackend.getNews());
      return;
    }

    await markNewsRead(id);
    showSuccess("Marqué comme lu");
    const refreshed = await fetchNews();
    setApiNews(refreshed);
  };

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        <header className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Actualités</h1>
            <p className="text-slate-500 text-sm">La vie de l'établissement</p>
          </div>
        </header>

        <div className="space-y-6">
          {items.map((item: any) => (
            <Card key={item.id} className={`border-none shadow-md bg-white overflow-hidden group ${item.is_read ? "opacity-75" : ""}`}>
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image_url || "https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=800"}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-indigo-600 border-none font-bold">
                  {item.category || "Actualité"}
                </Badge>
                {item.is_read && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <Calendar size={14} />
                    {getDate(item.published_at)}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">{item.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-colors ${item.is_read ? "bg-slate-100 text-slate-400" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}
                  >
                    <ExternalLink size={16} />
                    {item.is_read ? "Déjà lu" : item.link_url ? "Voir le lien" : "Marquer comme lu"}
                  </button>

                  {item.link_url && (
                    <a
                      href={item.link_url}
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
            <div className="text-center text-sm text-slate-500 py-12">Aucune actualité pour le moment.</div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default News;