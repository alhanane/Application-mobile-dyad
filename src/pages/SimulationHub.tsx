"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, Info, RefreshCw, ArrowRight } from 'lucide-react';
import { mockBackend } from '@/services/mockBackend';
import { showSuccess } from '@/utils/toast';

const SimulationHub = () => {
  const navigate = useNavigate();

  const handleReset = () => {
    mockBackend.resetData();
    showSuccess("Données de simulation réinitialisées");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Simulation Al Hanane</h1>
          <p className="text-slate-500">Testez l'expérience complète Parent et Admin</p>
        </div>

        <div className="grid gap-6">
          <Card className="border-none shadow-xl hover:shadow-2xl transition-shadow overflow-hidden group">
            <div className="h-2 bg-indigo-600" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <User size={24} />
                </div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Vue Parent</span>
              </div>
              <CardTitle className="text-xl mt-4">Espace Parent</CardTitle>
              <CardDescription>
                Consultez les notes d'info, les actualités et gérez vos demandes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/')} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold py-6 rounded-xl group"
              >
                Accéder au Mobile <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl hover:shadow-2xl transition-shadow overflow-hidden group">
            <div className="h-2 bg-emerald-500" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Vue Admin</span>
              </div>
              <CardTitle className="text-xl mt-4">Back-Office Admin</CardTitle>
              <CardDescription>
                Publiez du contenu, ciblez les classes et répondez aux demandes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/admin-sim')} 
                variant="outline"
                className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold py-6 rounded-xl group"
              >
                Gérer l'établissement <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg mt-0.5">
              <Info size={16} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">Comment ça marche ?</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Les changements effectués dans l'espace Admin sont immédiatement visibles dans l'espace Parent grâce à la persistance locale.
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            className="w-full text-[10px] text-slate-400 hover:text-rose-500 font-bold uppercase tracking-widest"
          >
            <RefreshCw size={12} className="mr-2" /> Réinitialiser les données
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimulationHub;