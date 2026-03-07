"use client";

import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle, 
  ChevronLeft, 
  ShieldAlert, 
  Trophy, 
  MessageSquare,
  Ban
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

type EventType = 'absence' | 'retard' | 'discipline';
type DisciplineType = 'felicitations' | 'observation' | 'avertissement' | 'colle' | 'exclusion';

const Attendance = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<EventType | 'all'>('all');

  const events = [
    { id: 1, type: 'absence', date: '12 Oct 2023', duration: 'Journée entière', reason: 'Grippe', status: 'justified', subject: 'Toutes matières' },
    { id: 2, type: 'discipline', disciplineType: 'felicitations', date: '11 Oct 2023', reason: 'Excellente participation en classe', teacher: 'Mme. Leroy', subject: 'Français' },
    { id: 3, type: 'retard', date: '10 Oct 2023', duration: '15 min', reason: 'Panne de bus', status: 'justified', subject: 'Mathématiques' },
    { id: 4, type: 'discipline', disciplineType: 'colle', date: '09 Oct 2023', duration: '2 heures', reason: 'Bavardages répétés malgré avertissements', teacher: 'M. Dupont', subject: 'Mathématiques' },
    { id: 5, type: 'absence', date: '05 Oct 2023', duration: 'Après-midi', reason: 'Rendez-vous médical', status: 'justified', subject: 'Histoire, EPS' },
    { id: 6, type: 'discipline', disciplineType: 'observation', date: '04 Oct 2023', reason: 'Oubli de matériel (cahier)', teacher: 'M. Martin', subject: 'Histoire-Géo' },
    { id: 7, type: 'retard', date: '02 Oct 2023', duration: '10 min', reason: 'Non justifié', status: 'pending', subject: 'Français' },
  ];

  const getDisciplineConfig = (type?: DisciplineType) => {
    switch (type) {
      case 'felicitations': return { label: 'Félicitations', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' };
      case 'observation': return { label: 'Observation', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' };
      case 'avertissement': return { label: 'Avertissement', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' };
      case 'colle': return { label: 'Heure de colle', icon: ShieldAlert, color: 'text-orange-500', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700' };
      case 'exclusion': return { label: 'Exclusion', icon: Ban, color: 'text-rose-500', bg: 'bg-rose-50', badge: 'bg-rose-100 text-rose-700' };
      default: return { label: 'Discipline', icon: ShieldAlert, color: 'text-slate-500', bg: 'bg-slate-50', badge: 'bg-slate-100 text-slate-700' };
    }
  };

  const filteredEvents = events.filter(e => filter === 'all' || e.type === filter);

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        <header className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vie Scolaire</h1>
            <p className="text-slate-500 text-sm">Suivi complet de l'élève</p>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1">
            <div className="text-rose-500 mb-1">
              <AlertCircle size={16} />
            </div>
            <p className="text-xl font-bold text-slate-900">02</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Absences</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1">
            <div className="text-amber-500 mb-1">
              <Clock size={16} />
            </div>
            <p className="text-xl font-bold text-slate-900">02</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Retards</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1">
            <div className="text-indigo-500 mb-1">
              <ShieldAlert size={16} />
            </div>
            <p className="text-xl font-bold text-slate-900">03</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Discipline</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Tout' },
            { id: 'absence', label: 'Absences' },
            { id: 'retard', label: 'Retards' },
            { id: 'discipline', label: 'Discipline' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={cn(
                "flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-all",
                filter === f.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const isDiscipline = event.type === 'discipline';
            const config = isDiscipline ? getDisciplineConfig(event.disciplineType as DisciplineType) : null;

            return (
              <Card key={event.id} className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-xl",
                        event.type === 'absence' ? "bg-rose-50 text-rose-500" : 
                        event.type === 'retard' ? "bg-amber-50 text-amber-500" : 
                        config?.bg + " " + config?.color
                      )}>
                        {event.type === 'absence' ? <CalendarIcon size={20} /> : 
                         event.type === 'retard' ? <Clock size={20} /> : 
                         config && <config.icon size={20} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 capitalize">
                          {isDiscipline ? config?.label : event.type}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {event.date} {event.duration ? `• ${event.duration}` : ''}
                        </p>
                      </div>
                    </div>
                    {isDiscipline ? (
                      <Badge className={cn("text-[10px] border-none", config?.badge)}>
                        {event.subject}
                      </Badge>
                    ) : (
                      <Badge className={cn(
                        "text-[10px] border-none",
                        event.status === 'justified' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {event.status === 'justified' ? 'Justifié' : 'En attente'}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="pl-11 space-y-2">
                    {!isDiscipline && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-semibold">Matière:</span>
                        <span>{event.subject}</span>
                      </div>
                    )}
                    {isDiscipline && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-semibold">Professeur:</span>
                        <span>{event.teacher}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <span className="font-semibold">Motif:</span>
                      <span className="italic">"{event.reason}"</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Attendance;