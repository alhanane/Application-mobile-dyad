/**
 * Page Demandes - Institution AL HANANE
 */

import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronLeft, MessageSquare, Plus, RefreshCw, Send, FileText,
  CheckCircle, Clock, AlertCircle, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '@/hooks/useRequests';
import { useAuth } from '@/auth/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ApiError } from '@/lib/api';

const Messages = () => {
  const navigate = useNavigate();
  const { children } = useAuth();
  const { 
    requests, 
    types, 
    isLoading, 
    error, 
    createRequest, 
    refresh 
  } = useRequests();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: 0,
    request_type_id: 0,
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: fr });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-amber-500" />;
      case 'in_progress': return <AlertCircle size={16} className="text-blue-500" />;
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected': return <XCircle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      in_progress: 'En cours de traitement',
      completed: 'Terminée',
      rejected: 'Refusée',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (formData.student_id === 0 || formData.request_type_id === 0 || !formData.message) {
      setSubmitError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestId = await createRequest({
        student_id: formData.student_id,
        request_type_id: formData.request_type_id,
        subject: formData.subject,
        message: formData.message,
      });

      if (requestId) {
        setSuccessMessage('Votre demande a été envoyée avec succès.');
        setFormData({
          student_id: 0,
          request_type_id: 0,
          subject: '',
          message: '',
        });
        setShowForm(false);
      }
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : 'Une erreur est survenue.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Mes Demandes</h1>
            <p className="text-slate-500 text-sm">Suivez vos demandes administratives</p>
          </div>
          <button 
            onClick={refresh}
            className="p-2 bg-white rounded-full shadow-sm border border-slate-100"
            disabled={isLoading}
          >
            <RefreshCw size={20} className={`text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
            {successMessage}
          </div>
        )}

        {/* Bouton nouvelle demande */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={20} className="mr-2" />
            Nouvelle demande
          </Button>
        )}

        {/* Formulaire nouvelle demande */}
        {showForm && (
          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Nouvelle demande</h2>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Enfant concerné *</Label>
                  <select
                    id="student"
                    value={formData.student_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, student_id: parseInt(e.target.value) }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white"
                    required
                  >
                    <option value="0">Sélectionner un enfant</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.first_name} {child.last_name} ({child.full_class})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type de demande *</Label>
                  <select
                    id="type"
                    value={formData.request_type_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, request_type_id: parseInt(e.target.value) }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white"
                    required
                  >
                    <option value="0">Sélectionner un type</option>
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Objet (optionnel)</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Ex: Demande d'attestation de scolarité"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Décrivez votre demande..."
                    className="min-h-[120px] rounded-xl"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSubmitting ? (
                      'Envoi...'
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        Envoyer
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Liste des demandes */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Historique des demandes</h2>

          {isLoading ? (
            // Skeleton loading
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="border-none shadow-md bg-white">
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4" />
                  <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucune demande pour le moment</p>
              <p className="text-sm mt-2">Cliquez sur "Nouvelle demande" pour commencer</p>
            </div>
          ) : (
            requests.map((request) => (
              <Card 
                key={request.id} 
                className="border-none shadow-md bg-white overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      request.status === 'pending' ? 'bg-amber-50' :
                      request.status === 'in_progress' ? 'bg-blue-50' :
                      request.status === 'completed' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      {getStatusIcon(request.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <Badge className={getStatusColor(request.status)} variant="outline">
                          {getStatusLabel(request.status)}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {formatDate(request.created_at)}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1">
                        {request.subject || request.type_label}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {request.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <span>{request.student_first_name} {request.student_last_name}</span>
                        <span>•</span>
                        <span>{request.student_class}</span>
                        {request.responses_count > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-medium">
                              {request.responses_count} réponse(s)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Messages;
