"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, Lock, User } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const ok = await login(username, password);

    setLoading(false);
    if (!ok) {
      setError("Identifiants incorrects. Vérifiez le login et le mot de passe reçus par SMS.");
      return;
    }

    navigate("/", { replace: true });
  };

  const fillDemo = () => {
    setUsername("parent.pere");
    setPassword("123456");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
            <GraduationCap size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Institution AL HANANE</h1>
            <p className="text-sm text-slate-500">Connexion Parent</p>
          </div>
        </div>

        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Login</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-none"
                    placeholder="Ex: parent.pere"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-none"
                    placeholder="••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold"
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Button>

              <button
                type="button"
                onClick={fillDemo}
                className="w-full text-xs font-bold text-indigo-700 hover:text-indigo-800"
              >
                Utiliser les identifiants de démo
              </button>

              <p className="text-xs text-slate-500 leading-relaxed">
                Les identifiants sont fournis par le service informatique et envoyés par SMS en début d'année scolaire.
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-[11px] text-slate-400">
          Démo : <span className="font-semibold">parent.pere</span> / <span className="font-semibold">123456</span>
        </div>
      </div>
    </div>
  );
};

export default Login;