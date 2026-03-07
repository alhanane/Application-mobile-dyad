"use client";

import React, { useEffect, useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Save, LogOut } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import { useAuth } from "@/auth/AuthContext";
import { USE_PHP_API } from "@/services/appMode";
import { fetchProfile, updateProfile } from "@/services/phpApi";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const { parent, logout } = useAuth();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    cin: "",
    gsm: "",
    telDomicile: "",
    adresse: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!USE_PHP_API) {
      setFormData({
        nom: "Martin",
        prenom: "Jean",
        cin: "AB123456",
        gsm: "06 12 34 56 78",
        telDomicile: "05 22 33 44 55",
        adresse: "123 Rue des Lilas, Casablanca",
      });
      return;
    }

    (async () => {
      try {
        const profile = await fetchProfile();
        setFormData({
          nom: profile.last_name ?? "",
          prenom: profile.first_name ?? "",
          cin: profile.cin ?? "",
          gsm: profile.gsm ?? "",
          telDomicile: profile.home_phone ?? "",
          adresse: profile.address ?? "",
        });
      } catch {
        // Erreur silencieuse : on garde les valeurs par défaut
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!USE_PHP_API) {
      showSuccess("Informations mises à jour avec succès");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        cin: formData.cin,
        gsm: formData.gsm,
        home_phone: formData.telDomicile,
        address: formData.adresse,
      });
      showSuccess("Informations mises à jour avec succès");
    } catch {
      showSuccess("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = parent ? `${parent.first_name} ${parent.last_name}` : `${formData.prenom} ${formData.nom}`;

  return (
    <MobileLayout>
      <div className="p-6 space-y-8">
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 border-4 border-white shadow-xl mx-auto">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`} />
                <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <button
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full border-2 border-white shadow-lg hover:bg-indigo-700 transition-colors"
                aria-label="Modifier la photo"
                title="Modifier la photo"
              >
                <Camera size={14} />
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="h-11 w-11 rounded-full bg-slate-700 text-white shadow-sm hover:bg-slate-800 transition-colors flex items-center justify-center"
              aria-label="Déconnexion"
              title="Déconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">M. {displayName}</h1>
            <p className="text-slate-500 text-sm font-medium">Parent d'élève • Institution AL HANANE</p>
          </div>
        </header>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">Informations Personnelles</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-xs text-slate-400 uppercase font-bold">
                  Prénom
                </Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="bg-slate-50 border-none h-10"
                  disabled={USE_PHP_API}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-xs text-slate-400 uppercase font-bold">
                  Nom
                </Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="bg-slate-50 border-none h-10"
                  disabled={USE_PHP_API}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cin" className="text-xs text-slate-400 uppercase font-bold">
                N° CIN
              </Label>
              <Input
                id="cin"
                value={formData.cin}
                onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                className="bg-slate-50 border-none h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gsm" className="text-xs text-slate-400 uppercase font-bold">
                  N° GSM
                </Label>
                <Input
                  id="gsm"
                  value={formData.gsm}
                  onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
                  className="bg-slate-50 border-none h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tel" className="text-xs text-slate-400 uppercase font-bold">
                  Tél. Domicile
                </Label>
                <Input
                  id="tel"
                  value={formData.telDomicile}
                  onChange={(e) => setFormData({ ...formData, telDomicile: e.target.value })}
                  className="bg-slate-50 border-none h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse" className="text-xs text-slate-400 uppercase font-bold">
                Adresse
              </Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="bg-slate-50 border-none h-10"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-xl mt-2"
            >
              <Save size={18} className="mr-2" />
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default Profile;