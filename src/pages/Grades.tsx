"use client";

import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, BookOpen } from 'lucide-react';

const Grades = () => {
  const subjects = [
    { name: "Français", grade: 15.5, max: 20, progress: 78, color: "bg-blue-500" },
    { name: "Mathématiques", grade: 18.0, max: 20, progress: 90, color: "bg-indigo-500" },
    { name: "Histoire-Géo", grade: 14.0, max: 20, progress: 70, color: "bg-amber-500" },
    { name: "Anglais", grade: 16.5, max: 20, progress: 82, color: "bg-emerald-500" },
    { name: "Physique-Chimie", grade: 13.5, max: 20, progress: 68, color: "bg-rose-500" },
  ];

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Résultats Scolaires</h1>
          <p className="text-slate-500 text-sm">Trimestre 1 • 2023-2024</p>
        </header>

        <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-indigo-100 text-xs uppercase tracking-wider font-semibold">Moyenne du Trimestre</p>
              <h2 className="text-3xl font-bold">16.2 <span className="text-lg font-normal opacity-80">/ 20</span></h2>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <TrendingUp size={32} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            Détails par matière
          </h3>
          <div className="space-y-3">
            {subjects.map((subject, i) => (
              <Card key={i} className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{subject.name}</span>
                    <span className="text-indigo-600 font-bold">{subject.grade} / {subject.max}</span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={subject.progress} className="h-2 bg-slate-100" />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Progression</span>
                      <span>{subject.progress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Grades;