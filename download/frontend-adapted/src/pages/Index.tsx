/**
 * Page d'accueil - Institution AL HANANE
 * Affiche le tableau de bord parent avec les dernières publications
 */

import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, ChevronRight, Newspaper, Info, FileText, MessageSquare, Clock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useParentName } from '@/auth/AuthContext';
import { useInfoNotes } from '@/hooks/useInfoNotes';
import { useNews } from '@/hooks/useNews';
import { useRequests } from '@/hooks/useRequests';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Index = () => {
  const navigate = useNavigate();
  const { children, isLoading: authLoading } = useAuth();
  const parentName = useParentName();
  
  const { notes, isLoading: notesLoading, unreadCount: infoUnread, refresh: refreshInfo } = useInfoNotes();
  const { news, isLoading: newsLoading, unreadCount: newsUnread, refresh: refreshNews } = useNews();
  const { requests, isLoading: requestsLoading, pendingCount, refresh: refreshRequests } = useRequests();

  const isLoading = authLoading || notesLoading || newsLoading || requestsLoading;

  // Dernières publications
  const lastInfoNote = notes[0];
  const lastNews = news[0];
  const lastRequest = requests[0];

  // Formatage de la date
  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: fr });
  };

  // Formatage du statut de demande
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      in_progress: 'En cours',
      completed: 'Terminée',
      rejected: 'Refusée',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'border-amber-200 text-amber-600 bg-amber-50',
      in_progress: 'border-blue-200 text-blue-600 bg-blue-50',
      completed: 'border-green-200 text-green-600 bg-green-50',
      rejected: 'border-red-200 text-red-600 bg-red-50',
    };
    return colors[status] || '';
  };

  const handleRefresh = async () => {
    await Promise.all([refreshInfo(), refreshNews(), refreshRequests()]);
  };

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bonjour, {parentName || 'Parent'}
            </h1>
            <p className="text-slate-500 text-sm">Institution AL HANANE</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              className="p-2 bg-white rounded-full shadow-sm border border-slate-100"
              disabled={isLoading}
            >
              <RefreshCw size={20} className={`text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 bg-white rounded-full shadow-sm border border-slate-100 relative">
              <Bell size={20} className="text-slate-600" />
              {(infoUnread + newsUnread + pendingCount) > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </div>

        {/* Enfants */}
        {children.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mes Enfants</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {children.map((child) => (
                <div key={child.id} className="flex flex-col items-center gap-2 min-w-[100px]">
                  <div className="p-1 rounded-full border-2 border-indigo-600 shadow-sm">
                    {child.avatar_url ? (
                      <img 
                        src={child.avatar_url} 
                        alt={child.first_name} 
                        className="h-12 w-12 rounded-full bg-slate-100 object-cover" 
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {child.first_name[0]}{child.last_name[0]}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800">{child.first_name}</p>
                    <p className="text-[10px] font-medium text-indigo-600">{child.full_class}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Indicateurs non lus */}
        <div className="grid grid-cols-3 gap-3">
          <Card 
            className={`${infoUnread > 0 ? 'bg-indigo-200 border-indigo-300' : 'bg-slate-100 border-slate-200'} border shadow-sm cursor-pointer active:scale-95 transition-transform`}
            onClick={() => navigate('/info')}
          >
            <CardContent className="p-3 space-y-2">
              <div className="bg-white/90 text-indigo-700 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">
                <Info size={16} />
              </div>
              <div>
                <p className="text-[8px] text-indigo-950 font-bold uppercase">Notes d'info</p>
                <p className="text-lg font-extrabold text-indigo-900">{infoUnread}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`${newsUnread > 0 ? 'bg-indigo-200 border-indigo-300' : 'bg-slate-100 border-slate-200'} border shadow-sm cursor-pointer active:scale-95 transition-transform`}
            onClick={() => navigate('/news')}
          >
            <CardContent className="p-3 space-y-2">
              <div className="bg-white/90 text-amber-600 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">
                <Newspaper size={16} />
              </div>
              <div>
                <p className="text-[8px] text-indigo-950 font-bold uppercase">Actualités</p>
                <p className="text-lg font-extrabold text-indigo-900">{newsUnread}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`${pendingCount > 0 ? 'bg-indigo-200 border-indigo-300' : 'bg-slate-100 border-slate-200'} border shadow-sm cursor-pointer active:scale-95 transition-transform`}
            onClick={() => navigate('/messages')}
          >
            <CardContent className="p-3 space-y-2">
              <div className="bg-white/90 text-emerald-600 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-[8px] text-indigo-950 font-bold uppercase">Demandes</p>
                <p className="text-lg font-extrabold text-indigo-900">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dernières publications */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Dernières publications</h2>
          
          <div className="space-y-3">
            {lastInfoNote && (
              <button 
                onClick={() => navigate('/info')}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors">
                  <FileText size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <Badge className="bg-indigo-100 text-indigo-700 border-none text-[9px] font-bold uppercase">
                      Note d'info
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatDate(lastInfoNote.published_at)}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{lastInfoNote.title}</h3>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            )}

            {lastNews && (
              <button 
                onClick={() => navigate('/news')}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="bg-amber-50 text-amber-500 p-3 rounded-xl group-hover:bg-amber-100 transition-colors">
                  <Newspaper size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <Badge className="bg-amber-100 text-amber-700 border-none text-[9px] font-bold uppercase">
                      Actualité
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatDate(lastNews.published_at)}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{lastNews.title}</h3>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            )}

            {lastRequest && (
              <button 
                onClick={() => navigate('/messages')}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl group-hover:bg-emerald-100 transition-colors">
                  <MessageSquare size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-bold uppercase">
                      Ma demande
                    </Badge>
                    <Badge variant="outline" className={`text-[9px] ${getStatusColor(lastRequest.status)}`}>
                      {getStatusLabel(lastRequest.status)}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                    {lastRequest.subject || lastRequest.type_label}
                  </h3>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            )}

            {!lastInfoNote && !lastNews && !lastRequest && !isLoading && (
              <div className="text-center py-8 text-slate-500">
                <p>Aucune publication récente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Index;
