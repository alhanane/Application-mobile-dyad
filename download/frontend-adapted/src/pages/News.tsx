/**
 * Page Actualités - Institution AL HANANE
 */

import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, FileText, ExternalLink, Calendar, Newspaper, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNews } from '@/hooks/useNews';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const News = () => {
  const navigate = useNavigate();
  const { news, isLoading, error, markAsRead, refresh } = useNews();

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: fr });
  };

  const handleOpenNews = async (newsId: number) => {
    await markAsRead(newsId);
  };

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 bg-white rounded-full shadow-sm border border-slate-100"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Actualités</h1>
            <p className="text-slate-500 text-sm">Événements et nouvelles de l'école</p>
          </div>
          <button 
            onClick={refresh}
            className="p-2 bg-white rounded-full shadow-sm border border-slate-100"
            disabled={isLoading}
          >
            <RefreshCw size={20} className={`text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Liste des actualités */}
        <div className="space-y-6">
          {isLoading ? (
            // Skeleton loading
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="border-none shadow-md bg-white overflow-hidden">
                <div className="h-48 bg-slate-200 animate-pulse" />
                <CardContent className="p-5 space-y-4">
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4" />
                  <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : news.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Newspaper size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucune actualité pour le moment</p>
            </div>
          ) : (
            news.map((item) => (
              <Card 
                key={item.id} 
                className={`border-none shadow-md bg-white overflow-hidden group ${
                  !item.is_read ? 'ring-2 ring-amber-500 ring-offset-2' : ''
                }`}
              >
                {item.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {item.category_label && (
                      <Badge 
                        className="absolute top-4 left-4 backdrop-blur-sm border-none font-bold"
                        style={{ backgroundColor: item.category_color || '#F59E0B', color: 'white' }}
                      >
                        {item.category_label}
                      </Badge>
                    )}
                    {!item.is_read && (
                      <Badge className="absolute top-4 right-4 bg-amber-500 text-white border-none">
                        Nouveau
                      </Badge>
                    )}
                  </div>
                )}
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <Calendar size={14} />
                      {formatDate(item.published_at)}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">
                      {item.title}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    {item.pdf_url && (
                      <a
                        href={item.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleOpenNews(item.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors"
                      >
                        <FileText size={16} />
                        {item.pdf_filename || 'Télécharger PDF'}
                      </a>
                    )}
                    {item.link_url && (
                      <a
                        href={item.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleOpenNews(item.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                      >
                        <ExternalLink size={16} />
                        Consulter
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default News;
