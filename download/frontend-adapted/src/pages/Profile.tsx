/**
 * Page Profil - Institution AL HANANE
 * Affiche les informations du parent connecté et permet la déconnexion
 */

import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, User, Mail, Phone, MapPin, LogOut, 
  Bell, Smartphone, Shield, ChevronRight, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Profile = () => {
  const navigate = useNavigate();
  const { parent, children, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Non renseigné';
    return format(new Date(timestamp), "d MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  // Nombre d'appareils enregistrés (mock pour l'instant)
  const deviceCount = 1;

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
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mon Profil</h1>
            <p className="text-slate-500 text-sm">Informations du compte</p>
          </div>
        </header>

        {/* Carte profil */}
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                {parent ? `${parent.first_name[0]}${parent.last_name[0]}` : 'PP'}
              </div>
              
              {/* Infos */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {parent ? `${parent.first_name} ${parent.last_name}` : 'Parent'}
                </h2>
                <p className="text-sm text-slate-500">@{parent?.login || 'login'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mes enfants */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Mes enfants ({children.length})
          </h3>
          <div className="space-y-3">
            {children.map((child) => (
              <Card key={child.id} className="border-none shadow-sm bg-white">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {child.first_name[0]}{child.last_name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {child.first_name} {child.last_name}
                    </p>
                    <p className="text-sm text-slate-500">{child.full_class}</p>
                  </div>
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    {child.relationship === 'pere' ? 'Père' : 
                     child.relationship === 'mere' ? 'Mère' : 
                     child.relationship === 'tuteur' ? 'Tuteur' : 'Autre'}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Informations de contact */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Coordonnées
          </h3>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-0 divide-y divide-slate-100">
              {parent?.email && (
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Mail size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900">{parent.email}</p>
                  </div>
                </div>
              )}
              
              {parent?.gsm && (
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Phone size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Téléphone</p>
                    <p className="text-sm font-medium text-slate-900">{parent.gsm}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Paramètres */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Paramètres
          </h3>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-0 divide-y divide-slate-100">
              <button 
                className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                onClick={() => navigate('/notifications-settings')}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Bell size={18} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500">Gérer les alertes push</p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </button>

              <button 
                className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                onClick={() => navigate('/devices')}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Smartphone size={18} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">Appareils</p>
                  <p className="text-xs text-slate-500">{deviceCount} appareil(s) enregistré(s)</p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </button>

              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Shield size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Dernière connexion</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(parent?.last_login_at || null)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aide */}
        <Card className="border-none shadow-sm bg-amber-50 border border-amber-100">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Besoin d'aide ?
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Contactez le service informatique de l'école pour toute modification 
                de vos informations personnelles.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Déconnexion */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
          disabled={isLoggingOut}
        >
          <LogOut size={18} className="mr-2" />
          {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
        </Button>

        {/* Version */}
        <div className="text-center text-xs text-slate-400 pb-4">
          <p>Application PWA v2.0.0</p>
          <p className="mt-1">© 2024-2025 Institution AL HANANE</p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;
