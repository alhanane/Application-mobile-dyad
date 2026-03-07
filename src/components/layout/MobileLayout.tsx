"use client";

import React from 'react';
import { 
  Home, Calendar, MessageSquare, User, Menu, 
  Newspaper, ShieldAlert, GraduationCap, Award, Folder, 
  Lightbulb, Bus, CreditCard, Image, Search, ShoppingBag,
  LineChart, Info, ClipboardList, Phone, LogOut, ShieldCheck
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { isModuleActive, ModuleId } from '@/config/modules';
import { useAuth } from '@/auth/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  id: ModuleId | 'admin-sim';
  icon: any;
  label: string;
  path: string;
  category?: string;
}

const MobileLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const allBottomNavItems: NavItem[] = [
    { id: 'home', icon: Home, label: 'Accueil', path: '/' },
    { id: 'messages', icon: MessageSquare, label: 'Demandes', path: '/messages' },
    { id: 'info', icon: Info, label: 'Infos', path: '/info' },
    { id: 'contact', icon: Phone, label: 'Contact', path: '/contact' },
    { id: 'profile', icon: User, label: 'Compte', path: '/profile' },
  ];

  const allSidebarItems: NavItem[] = [
    { id: 'home', icon: Home, label: 'Accueil', path: '/', category: 'Général' },
    { id: 'info', icon: Info, label: "Notes d'information", path: '/info', category: 'Général' },
    { id: 'news', icon: Newspaper, label: 'Actualités', path: '/news', category: 'Général' },
    { id: 'contact', icon: Phone, label: 'Contact', path: '/contact', category: 'Général' },
    
    { id: 'schedule', icon: Calendar, label: 'Emploi du temps', path: '/schedule', category: 'Scolarité' },
    { id: 'attendance', icon: ShieldAlert, label: 'Vie scolaire', path: '/attendance', category: 'Scolarité' },
    { id: 'homework', icon: ClipboardList, label: 'Devoirs', path: '/homework', category: 'Scolarité' },
    { id: 'tracking', icon: LineChart, label: 'Suivi pédagogique', path: '/tracking', category: 'Scolarité' },
    { id: 'grades', icon: GraduationCap, label: 'Résultats', path: '/grades', category: 'Scolarité' },
    { id: 'skills', icon: Award, label: 'Compétences', path: '/skills', category: 'Scolarité' },
    { id: 'resources', icon: Folder, label: 'Ressources', path: '/resources', category: 'Scolarité' },
    
    { id: 'messages', icon: MessageSquare, label: 'Mes demandes', path: '/messages', category: 'Communication' },
    { id: 'suggestions', icon: Lightbulb, label: 'Mes suggestions', path: '/suggestions', category: 'Communication' },
    
    { id: 'transport', icon: Bus, label: 'Transport', path: '/transport', category: 'Services' },
    { id: 'finance', icon: CreditCard, label: 'Dossier financier', path: '/finance', category: 'Services' },
    { id: 'photos', icon: Image, label: 'Album photo', path: '/photos', category: 'Services' },
    { id: 'lost-found', icon: Search, label: 'Objets perdus', path: '/lost-found', category: 'Services' },
    { id: 'shop', icon: ShoppingBag, label: 'Boutique', path: '/shop', category: 'Services' },
    
    { id: 'profile', icon: User, label: 'Mon compte', path: '/profile', category: 'Compte' },
    { id: 'admin-sim', icon: ShieldCheck, label: 'Simulateur Backend', path: '/admin-sim', category: 'Développement' },
  ];

  const activeBottomNav = allBottomNavItems.filter(item => item.id === 'admin-sim' || isModuleActive(item.id as ModuleId));
  const activeSidebarItems = allSidebarItems.filter(item => item.id === 'admin-sim' || isModuleActive(item.id as ModuleId));
  const activeCategories = Array.from(new Set(activeSidebarItems.map(item => item.category)));

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 max-w-md mx-auto border-x shadow-xl relative">
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0 border-r-none">
            <SheetHeader className="p-6 border-b border-slate-50">
              <SheetTitle className="text-left flex items-center gap-3 text-indigo-600">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                  <GraduationCap size={20} />
                </div>
                <span className="font-bold text-lg tracking-tight">Institution AL HANANE</span>
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-85px)]">
              <div className="p-4 space-y-6">
                {activeCategories.map(category => (
                  <div key={category} className="space-y-2">
                    <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {activeSidebarItems
                        .filter(item => item.category === category)
                        .map((item) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <button
                              key={item.path}
                              onClick={() => navigate(item.path)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                isActive 
                                  ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              )}
                            >
                              <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                              {item.label}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}

                {/* Logout at end */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={18} />
                    Déconnexion
                  </button>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <GraduationCap size={18} />
          </div>
          <span className="font-bold text-slate-800">AL HANANE</span>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 pb-24 overflow-y-auto">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50">
        {activeBottomNav.filter(i => i.id !== 'admin-sim').map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-200",
                isActive ? "text-indigo-600 scale-110" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileLayout;