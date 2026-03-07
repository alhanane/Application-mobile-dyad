"use client";

import React, { useState, useEffect, useRef } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockBackend, MockRequest, MockInfoNote, MockNews, TargetType } from '@/services/mockBackend';
import { showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import {
  Send, Newspaper, Info, MessageSquare, ShieldCheck,
  Plus, Edit2, Trash2, Globe, FileText, X, Calendar, Upload, Image as ImageIcon, ArrowLeft
} from 'lucide-react';

const LEVELS = ["CP", "CE1", "CE2", "CM1", "CM2", "6ème", "5ème", "4ème", "3ème"];
const CLASSES = ["A", "B", "C", "D", "E"];

const AdminSimulation = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'notes' | 'news' | 'requests'>('notes');
  const [notes, setNotes] = useState<MockInfoNote[]>([]);
  const [news, setNews] = useState<MockNews[]>([]);
  const [requests, setRequests] = useState<MockRequest[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link_url: "",
    pdf_url: "",
    category: "Information",
    image_url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800",
    published_at: new Date().toISOString().slice(0, 16),
    target_type: 'all' as TargetType,
    target_level: "",
    target_class: ""
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [selectedReplyFile, setSelectedReplyFile] = useState<File | null>(null);
  const [selectedReqId, setSelectedReqId] = useState<number | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setNotes(mockBackend.getNotes());
    setNews(mockBackend.getNews());
    setRequests(mockBackend.getRequests());
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      link_url: "",
      pdf_url: "",
      category: "Information",
      image_url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800",
      published_at: new Date().toISOString().slice(0, 16),
      target_type: 'all',
      target_level: "",
      target_class: ""
    });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsEditing(false);
    setEditId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleReplyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedReplyFile(e.target.files[0]);
    }
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulation d'upload : on crée une URL locale pour le fichier
    let finalFileUrl = formData.pdf_url;
    let finalImageUrl = formData.image_url;

    if (selectedFile) {
      const localUrl = URL.createObjectURL(selectedFile);
      if (selectedFile.type.includes('image')) {
        finalImageUrl = localUrl;
      } else {
        finalFileUrl = localUrl;
      }
    }

    const targetValue = formData.target_type === 'level' ? formData.target_level :
                        formData.target_type === 'class' ? `${formData.target_level} ${formData.target_class}` :
                        undefined;

    const payload = {
      ...formData,
      image_url: finalImageUrl,
      pdf_url: finalFileUrl,
      target_value: targetValue
    };

    if (activeTab === 'notes') {
      if (isEditing && editId) {
        mockBackend.updateNote(editId, payload);
        showSuccess("Note mise à jour (Fichier uploadé)");
      } else {
        mockBackend.publishNote(payload);
        showSuccess("Note publiée avec succès");
      }
    } else if (activeTab === 'news') {
      if (isEditing && editId) {
        mockBackend.updateNews(editId, payload);
        showSuccess("Actualité mise à jour (Fichier uploadé)");
      } else {
        mockBackend.publishNews(payload);
        showSuccess("Actualité publiée avec succès");
      }
    }
    resetForm();
    refreshData();
  };

  const startEdit = (item: MockInfoNote | MockNews) => {
    setFormData({
      title: item.title,
      description: item.description,
      link_url: item.link_url || "",
      pdf_url: item.pdf_url || "",
      category: (item as MockNews).category || "Information",
      image_url: item.image_url,
      published_at: item.published_at,
      target_type: item.target_type,
      target_level: item.target_type !== 'all' ? (item.target_value?.split(' ')[0] || "") : "",
      target_class: item.target_type === 'class' ? (item.target_value?.split(' ')[1] || "") : ""
    });
    setEditId(item.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (activeTab === 'notes') mockBackend.deleteNote(id);
    else mockBackend.deleteNews(id);
    refreshData();
    showSuccess("Contenu supprimé");
  };

  const handleReply = (id: number) => {
    const fileName = selectedReplyFile ? selectedReplyFile.name : undefined;
    const fileUrl = selectedReplyFile ? URL.createObjectURL(selectedReplyFile) : undefined;
    
    mockBackend.replyToRequest(id, replyMsg, fileName);
    
    setReplyMsg("");
    setSelectedReplyFile(null);
    if (replyFileInputRef.current) replyFileInputRef.current.value = "";
    setSelectedReqId(null);
    refreshData();
    showSuccess("Réponse envoyée avec le document joint");
  };

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        <header className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-indigo-600">
              <ShieldCheck size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Back-Office PHP (Simulé)</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/sim')} className="text-slate-400 hover:text-indigo-600">
              <ArrowLeft size={16} className="mr-1" /> Hub
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des contenus</h1>
        </header>

        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          {(['notes', 'news', 'requests'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab); resetForm(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              {tab === 'notes' ? 'Notes' : tab === 'news' ? 'Actus' : 'Demandes'}
            </button>
          ))}
        </div>

        {activeTab !== 'requests' && (
          <Card className="border-none shadow-md bg-indigo-50/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-indigo-600">
                  {isEditing ? <Edit2 size={18} /> : <Plus size={18} />}
                  <h2 className="font-bold">{isEditing ? 'Modifier' : 'Créer'} {activeTab === 'notes' ? 'une Note' : 'une Actu'}</h2>
                </div>
                {isEditing && <button onClick={resetForm} className="text-slate-400"><X size={18} /></button>}
              </div>
              
              <form onSubmit={handleSaveContent} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Titre</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="bg-white" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Texte / Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required className="bg-white min-h-[80px]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Date & Heure de publication</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <Input type="datetime-local" value={formData.published_at} onChange={(e) => setFormData({...formData, published_at: e.target.value})} required className="bg-white pl-9 text-xs" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Ciblage</Label>
                    <Select value={formData.target_type} onValueChange={(v: TargetType) => setFormData({...formData, target_type: v})}>
                      <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tout l'établissement</SelectItem>
                        <SelectItem value="level">Par Niveau</SelectItem>
                        <SelectItem value="class">Par Classe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.target_type !== 'all' && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded-xl border border-indigo-100">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Niveau</Label>
                      <Select value={formData.target_level} onValueChange={(v) => setFormData({...formData, target_level: v})}>
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                        <SelectContent>
                          {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.target_type === 'class' && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Classe</Label>
                        <Select value={formData.target_class} onValueChange={(v) => setFormData({...formData, target_class: v})}>
                          <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                          <SelectContent>
                            {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Pièce jointe (Image ou PDF)</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <Input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="application/pdf,image/*"
                        className="bg-white pl-9 text-xs pt-2" 
                      />
                    </div>
                    {selectedFile && (
                      <Badge variant="secondary" className="h-10 px-3">
                        {selectedFile.type.includes('image') ? <ImageIcon size={14} className="mr-1" /> : <FileText size={14} className="mr-1" />}
                        Fichier prêt
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Lien URL externe (Optionnel)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <Input value={formData.link_url} onChange={(e) => setFormData({...formData, link_url: e.target.value})} placeholder="https://..." className="bg-white pl-9" />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-indigo-600 font-bold py-6 rounded-xl">
                  {isEditing ? 'Mettre à jour & Republier' : 'Publier avec upload'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Listes de contenus */}
        {(activeTab === 'notes' || activeTab === 'news') && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Historique des publications</h3>
            {(activeTab === 'notes' ? notes : news).map(item => (
              <Card key={item.id} className="border-none shadow-sm bg-white">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[8px] uppercase">
                        {item.target_type === 'all' ? 'Tous' : item.target_value}
                      </Badge>
                      <span className="text-[9px] text-slate-400 font-medium">{item.published_at.replace('T', ' ')}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 truncate text-sm">{item.title}</h4>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Demandes */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-600" />
              Demandes à traiter
            </h2>
            {requests.filter(r => r.status === 'pending').map(req => (
              <Card key={req.id} className="border-none shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase">{req.childName} ({req.childClass})</p>
                      <h3 className="font-bold text-slate-900">{req.type}</h3>
                      <p className="text-[9px] text-slate-400">{req.date.replace('T', ' ')}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic">"{req.message}"</p>
                  
                  {selectedReqId === req.id ? (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Message de réponse</Label>
                        <Textarea placeholder="Votre réponse..." className="text-xs min-h-[80px]" value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Uploader le document (Facture, PDF...)</Label>
                        <div className="relative">
                          <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                          <Input 
                            type="file" 
                            ref={replyFileInputRef}
                            onChange={handleReplyFileChange}
                            accept="application/pdf,image/*"
                            className="pl-9 text-xs pt-2" 
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-emerald-600 font-bold" onClick={() => handleReply(req.id)}>Envoyer la réponse</Button>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedReqId(null)}>Annuler</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full text-xs font-bold" onClick={() => setSelectedReqId(req.id)}>Répondre au parent</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default AdminSimulation;