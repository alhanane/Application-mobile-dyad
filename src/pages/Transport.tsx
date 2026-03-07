"use client";

import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Bus, MapPin, Clock, Phone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Transport = () => {
  const navigate = useNavigate();

  const transportInfo = {
    circuit: "Ligne B - Circuit 42",
    busNumber: "BUS-782",
    driver: "M. Robert",
    phone: "06 12 34 56 78",
    stops: [
      { name: "Domicile (Rue des Lilas)", time: "07:45", type: "pickup", current: true },
      { name: "Place de la Mairie", time: "07:55", type: "stop", current: false },
      { name: "Gare Routière", time: "08:10", type: "stop", current: false },
      { name: "Collège Saint-Exupéry", time: "08:25", type: "dropoff", current: false },
    ]
  };

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        <header className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transport Scolaire</h1>
            <p className="text-slate-500 text-sm">Suivi du circuit en temps réel</p>
          </div>
        </header>

        {/* Main Info Card */}
        <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white border-none shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Bus size={32} />
              </div>
              <div className="text-right">
                <p className="text-amber-100 text-[10px] font-bold uppercase tracking-widest">Circuit</p>
                <h2 className="text-xl font-bold">{transportInfo.circuit}</h2>
              </div>
            </div>
            <div className="flex justify-between items-end pt-2">
              <div>
                <p className="text-amber-100 text-[10px] font-bold uppercase">Prochain Passage</p>
                <p className="text-2xl font-bold">07:45</p>
              </div>
              <div className="text-right">
                <p className="text-amber-100 text-[10px] font-bold uppercase">Véhicule</p>
                <p className="font-bold">{transportInfo.busNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
            <User size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800">{transportInfo.driver}</h3>
            <p className="text-xs text-slate-500">Chauffeur titulaire</p>
          </div>
          <button className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Phone size={20} />
          </button>
        </div>

        {/* Itinerary */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <MapPin size={18} className="text-orange-500" />
            Itinéraire de l'enfant
          </h3>
          
          <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {transportInfo.stops.map((stop, i) => (
              <div key={i} className="relative">
                <div className={cn(
                  "absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 border-white z-10",
                  stop.current ? "bg-orange-500 ring-4 ring-orange-100" : "bg-slate-300"
                )} />
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={cn(
                      "text-sm font-bold",
                      stop.current ? "text-slate-900" : "text-slate-500"
                    )}>
                      {stop.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {stop.type === 'pickup' ? 'Point de ramassage' : stop.type === 'dropoff' ? 'Arrivée établissement' : 'Arrêt intermédiaire'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-600 font-bold text-sm">
                    <Clock size={14} />
                    {stop.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Transport;