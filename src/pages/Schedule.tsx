"use client";

import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const Schedule = () => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
  const [activeDay, setActiveDay] = React.useState('Lun');

  const classes = [
    { time: "08:00 - 09:30", subject: "Français", room: "Salle 102", teacher: "Mme. Leroy", color: "border-l-blue-500" },
    { time: "09:45 - 11:15", subject: "Mathématiques", room: "Salle 204", teacher: "M. Dupont", color: "border-l-indigo-500" },
    { time: "11:30 - 12:30", subject: "Anglais", room: "Labo Langues", teacher: "Mme. Smith", color: "border-l-emerald-500" },
    { time: "14:00 - 15:30", subject: "Histoire-Géo", room: "Salle 301", teacher: "M. Martin", color: "border-l-amber-500" },
    { time: "15:45 - 17:15", subject: "EPS", room: "Gymnase", teacher: "M. Petit", color: "border-l-rose-500" },
  ];

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Emploi du Temps</h1>
          <p className="text-slate-500 text-sm">Semaine du 9 au 13 Octobre</p>
        </header>

        <div className="flex justify-between bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                activeDay === day ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="space-y-4 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {classes.map((item, i) => (
            <div key={i} className="flex gap-4 relative">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-indigo-600 z-10 flex-shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
              </div>
              <Card className={cn("flex-1 border-none border-l-4 shadow-sm bg-white", item.color)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-800">{item.subject}</h3>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      {item.time}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{item.teacher}</span>
                    <span className="font-medium">{item.room}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Schedule;