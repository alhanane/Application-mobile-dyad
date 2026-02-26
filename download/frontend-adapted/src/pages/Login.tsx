/**
 * Page de connexion - Institution AL HANANE
 * Authentification via l'API backend
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, Lock, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!username.trim() || !password.trim()) {
      setLocalError("Veuillez remplir tous les champs.");
      return;
    }

    const ok = await login(username.trim(), password);

    if (ok) {
      navigate("/", { replace: true });
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Logo et titre */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
            <GraduationCap size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Institution AL HANANE
            </h1>
            <p className="text-sm text-slate-500">Espace Parents</p>
          </div>
        </div>

        {/* Formulaire */}
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Login */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">
                  Login
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-none"
                    placeholder="Ex: parent.pere"
                    autoComplete="username"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-none"
                    placeholder="••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Erreur */}
              {displayError && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-sm text-rose-700 flex items-start gap-2">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <span>{displayError}</span>
                </div>
              )}

              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </Button>

              {/* Aide */}
              <div className="text-center">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Les identifiants sont fournis par le service informatique 
                  et envoyés par SMS en début d'année scolaire.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-400">
          <p>Application PWA v2.0.0</p>
          <p className="mt-1">© 2024-2025 Institution AL HANANE</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
