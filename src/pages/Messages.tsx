"use client";

import React, { useEffect, useMemo, useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  ChevronRight,
  Paperclip,
  MessageSquare,
  Send,
  User as UserIcon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccess } from "@/utils/toast";
import { useAuth } from "@/auth/AuthContext";
import { USE_PHP_API } from "@/services/appMode";
import { fetchRequests, createRequest, PhpRequestItem } from "@/services/phpApi";
import { getSelectedStudentId, setSelectedStudentId } from "@/services/selectionStore";
import { mockBackend, MockRequest } from "@/services/mockBackend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MOCK_CHILDREN = [
  { id: "1", name: "Lucas", class: "CE2/D" },
  { id: "2", name: "Emma", class: "CM2/E" },
];

const REQUEST_TYPES = ["attestation", "facture", "certificat", "autre"];

function formatDate(dt: string) {
  return dt.split(" ")[0] ?? dt;
}

const Messages = () => {
  const { students } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const [apiRequests, setApiRequests] = useState<PhpRequestItem[]>([]);
  const [requests, setRequests] = useState<MockRequest[]>(mockBackend.getRequests());

  const childrenList = useMemo(() => {
    if (!USE_PHP_API) return MOCK_CHILDREN;

    return (students ?? []).map((s) => ({
      id: String(s.id),
      name: `${s.first_name}`,
      class: `${s.level_code} ${s.class_code}`,
    }));
  }, [students]);

  const [newRequest, setNewRequest] = useState({
    childId: "",
    type: "",
    message: "",
  });

  useEffect(() => {
    if (!USE_PHP_API) {
      setRequests(mockBackend.getRequests());
      return;
    }

    (async () => {
      const items = await fetchRequests();
      setApiRequests(items);
    })();
  }, []);

  const items = USE_PHP_API ? apiRequests : requests;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const child = childrenList.find((c) => c.id === newRequest.childId);

    if (!USE_PHP_API) {
      mockBackend.createRequest({
        childName: child?.name || "Inconnu",
        childClass: child?.class || "",
        type: newRequest.type,
        message: newRequest.message || `Demande de ${newRequest.type}`,
      });

      setRequests(mockBackend.getRequests());
      setIsOpen(false);
      setNewRequest({ childId: "", type: "", message: "" });
      showSuccess("Votre demande a été envoyée avec succès");
      return;
    }

    const studentId = Number(newRequest.childId);
    if (!Number.isFinite(studentId) || studentId <= 0) {
      showSuccess("Veuillez sélectionner un enfant");
      return;
    }

    await createRequest(studentId, newRequest.type, newRequest.message || `Demande de ${newRequest.type}`);
    showSuccess("Votre demande a été envoyée avec succès");
    setIsOpen(false);
    setNewRequest({ childId: "", type: "", message: "" });
    const refreshed = await fetchRequests();
    setApiRequests(refreshed);
  };

  const handleDelete = async (id: number) => {
    if (!USE_PHP_API) {
      mockBackend.deleteRequest(id);
      setRequests(mockBackend.getRequests());
      showSuccess("Demande supprimée");
      return;
    }

    // L'API PHP n'a pas d'endpoint DELETE pour les demandes dans le scope actuel.
    // On pourrait l'ajouter plus tard. Pour l'instant, on ne fait rien côté serveur.
    showSuccess("Demande supprimée (local)");
    setApiRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mes demandes</h1>
            <p className="text-slate-500 text-sm">Suivi de vos requêtes administratives</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-transform">
                <Plus size={24} />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">Nouvelle demande</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Enfant concerné</Label>
                  <Select onValueChange={(v) => setNewRequest({ ...newRequest, childId: v })} required>
                    <SelectTrigger className="bg-slate-50 border-none h-12 rounded-xl">
                      <SelectValue placeholder="Sélectionner un enfant" />
                    </SelectTrigger>
                    <SelectContent>
                      {childrenList.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name} ({child.class})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Type de demande</Label>
                  <Select onValueChange={(v) => setNewRequest({ ...newRequest, type: v })} required>
                    <SelectTrigger className="bg-slate-50 border-none h-12 rounded-xl">
                      <SelectValue placeholder="Choisir le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REQUEST_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Message / Précisions</Label>
                  <Textarea
                    placeholder="Détaillez votre demande ici..."
                    className="bg-slate-50 border-none rounded-xl min-h-[120px] resize-none"
                    value={newRequest.message}
                    onChange={(e) => setNewRequest({ ...newRequest, message: e.target.value })}
                    required={newRequest.type === "autre"}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                >
                  <Send size={18} />
                  Envoyer la demande
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="space-y-4">
          {items.map((req: any) => {
            const hasResponse = !!req.response_message;
            const isPending = String(req.status).toLowerCase() === "pending";

            return (
              <Card
                key={req.id}
                className={cn(
                  "border-none shadow-sm overflow-hidden transition-all",
                  hasResponse ? "bg-indigo-100/70 ring-1 ring-indigo-200" : "bg-amber-100/70 ring-1 ring-amber-200"
                )}
              >
                <CardContent className="p-5 space-y-4 text-slate-900">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-xl text-white shadow-sm", hasResponse ? "bg-indigo-600" : "bg-amber-500")}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{req.type}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                          <span>{formatDate(req.created_at)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <UserIcon size={10} />
                            {USE_PHP_API ? `${req.student_first_name} ${req.student_last_name}` : req.childName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "text-[10px] border-none font-bold",
                          isPending ? "bg-amber-200 text-amber-900" : "bg-emerald-200 text-emerald-900"
                        )}
                      >
                        {isPending ? "En attente" : "Terminée"}
                      </Badge>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="p-2 rounded-xl bg-white/70 hover:bg-white transition-colors text-slate-500 hover:text-rose-600"
                            aria-label="Supprimer la demande"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-3xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la demande ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. La demande sera retirée de votre liste.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              className="rounded-xl bg-rose-600 hover:bg-rose-700"
                              onClick={() => handleDelete(req.id)}
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <p className="text-sm p-3 rounded-xl italic bg-white/70 text-slate-700">"{req.message}"</p>

                  {hasResponse && (
                    <div className="border-t border-indigo-200 pt-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="bg-indigo-600 text-white p-1.5 rounded-lg mt-0.5">
                          <MessageSquare size={14} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-indigo-950 mb-1">Réponse de l'école :</p>
                          <p className="text-xs leading-relaxed font-medium text-slate-700">{req.response_message}</p>
                        </div>
                      </div>

                      {req.response_attachment_url && (
                        <a
                          href={req.response_attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-between p-3 bg-white/70 rounded-xl border border-dashed border-indigo-300 group hover:bg-white transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Paperclip size={14} className="text-indigo-600" />
                            <span className="text-xs font-bold text-indigo-700">Pièce jointe</span>
                          </div>
                          <ChevronRight size={14} className="text-indigo-400" />
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {items.length === 0 && (
            <div className="text-center text-sm text-slate-500 py-12">Aucune demande pour le moment.</div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Messages;