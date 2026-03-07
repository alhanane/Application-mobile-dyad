"use client";

import React, { useEffect, useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Phone, Mail, MapPin, MessageSquare, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { USE_PHP_API } from "@/services/appMode";
import { fetchContact } from "@/services/phpApi";

const Contact = () => {
  const navigate = useNavigate();

  const [contactInfo, setContactInfo] = useState({
    phone: "+212 5 28 22 33 44",
    email: "contact@alhanane.ma",
    address: "Quartier Tilila, Agadir, Maroc",
  });

  useEffect(() => {
    if (!USE_PHP_API) return;

    (async () => {
      try {
        const contact = await fetchContact();
        setContactInfo({
          phone: contact.phone ?? "+212 5 28 22 33 44",
          email: contact.email ?? "contact@alhanane.ma",
          address: contact.address ?? "Quartier Tilila, Agadir, Maroc",
        });
      } catch {
        // Erreur silencieuse : on garde les valeurs par défaut
      }
    })();
  }, []);

  return (
    <MobileLayout>
      <div className="p-6 space-y-8">
        <header className="text-center space-y-4">
          <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-100">
            <GraduationCap size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Institution AL HANANE</h1>
            <p className="text-slate-500 text-sm">À votre écoute au quotidien</p>
          </div>
        </header>

        <div className="space-y-4">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Téléphone fixe</p>
                  <p className="font-bold text-slate-800">{contactInfo.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Adresse E-mail</p>
                  <p className="font-bold text-slate-800">{contactInfo.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Adresse physique</p>
                  <p className="font-bold text-slate-800 leading-relaxed">{contactInfo.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-indigo-50 border border-indigo-100 text-slate-900 overflow-hidden relative cursor-pointer hover:bg-indigo-100/60 transition-colors"
            onClick={() => navigate("/messages")}
          >
            <CardContent className="p-6">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700">
                  <MessageSquare size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Service en ligne</span>
                </div>
                <h3 className="font-bold text-lg">Une demande spécifique ?</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Envoyez-nous un message directement via l'application pour un traitement rapide de votre dossier.
                </p>
                <div className="flex items-center gap-1 text-indigo-700 text-sm font-bold pt-2">
                  Accéder à "Mes demandes" <ChevronRight size={16} />
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10 text-indigo-700">
                <MessageSquare size={140} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Contact;