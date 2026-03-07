"use client";

export type TargetType = 'all' | 'level' | 'class';

export interface MockInfoNote {
  id: number;
  title: string;
  description: string;
  image_url: string;
  pdf_url?: string;
  link_url?: string;
  target_type: TargetType;
  target_value?: string; // Nom du niveau ou de la classe
  published_at: string;
  is_read: boolean;
}

export interface MockNews {
  id: number;
  title: string;
  description: string;
  image_url: string;
  pdf_url?: string;
  link_url?: string;
  category: string;
  target_type: TargetType;
  target_value?: string;
  published_at: string;
  is_read: boolean;
}

export interface MockRequest {
  id: number;
  childName: string;
  childClass: string;
  type: string;
  message: string;
  status: 'pending' | 'completed';
  date: string;
  response?: {
    message: string;
    attachment?: string;
    date: string;
  };
}

const STORAGE_KEY = 'alhanane_mock_data';

class MockBackendService {
  private notes: MockInfoNote[] = [];
  private news: MockNews[] = [];
  private requests: MockRequest[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.notes.length === 0 && this.news.length === 0) {
      this.seedInitialData();
    }
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.notes = data.notes || [];
        this.news = data.news || [];
        this.requests = data.requests || [];
      } catch (e) {
        console.error("Failed to parse mock data", e);
      }
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      notes: this.notes,
      news: this.news,
      requests: this.requests
    }));
  }

  private seedInitialData() {
    this.notes = [
      {
        id: 1,
        title: "Règlement Intérieur 2023-2024",
        description: "Consultez la mise à jour du règlement intérieur de l'établissement pour cette nouvelle année scolaire.",
        image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
        pdf_url: "reglement_2023.pdf",
        target_type: 'all',
        published_at: new Date().toISOString().slice(0, 16),
        is_read: false
      }
    ];

    this.news = [
      {
        id: 1,
        title: "Sortie scolaire au Musée d'Orsay",
        description: "Les classes de 3ème participeront à une visite guidée exceptionnelle pour découvrir les chefs-d'œuvre de l'impressionnisme.",
        image_url: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=800",
        category: "Événement",
        target_type: 'all',
        published_at: new Date().toISOString().slice(0, 16),
        is_read: false
      }
    ];

    this.requests = [
      {
        id: 1,
        childName: "Lucas",
        childClass: "CE2/D",
        type: "Attestation de scolarité",
        message: "Bonjour, j'aurais besoin d'une attestation de scolarité pour Lucas pour mon dossier d'assurance. Merci.",
        status: 'pending',
        date: new Date().toISOString().slice(0, 16)
      }
    ];
    this.saveToStorage();
  }

  getNotes() { 
    this.loadFromStorage();
    return [...this.notes].sort((a, b) => b.published_at.localeCompare(a.published_at)); 
  }
  
  publishNote(note: Omit<MockInfoNote, 'id' | 'is_read'>) {
    const newNote: MockInfoNote = {
      ...note,
      id: Date.now(),
      is_read: false
    };
    this.notes.push(newNote);
    this.saveToStorage();
    return newNote;
  }

  updateNote(id: number, data: Partial<MockInfoNote>) {
    const index = this.notes.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notes[index] = { ...this.notes[index], ...data };
      this.saveToStorage();
    }
  }

  deleteNote(id: number) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.saveToStorage();
  }

  markNoteRead(id: number) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note.is_read = true;
      this.saveToStorage();
    }
  }

  getNews() { 
    this.loadFromStorage();
    return [...this.news].sort((a, b) => b.published_at.localeCompare(a.published_at)); 
  }
  
  publishNews(item: Omit<MockNews, 'id' | 'is_read'>) {
    const newItem: MockNews = {
      ...item,
      id: Date.now(),
      is_read: false
    };
    this.news.push(newItem);
    this.saveToStorage();
    return newItem;
  }

  updateNews(id: number, data: Partial<MockNews>) {
    const index = this.news.findIndex(n => n.id === id);
    if (index !== -1) {
      this.news[index] = { ...this.news[index], ...data };
      this.saveToStorage();
    }
  }

  deleteNews(id: number) {
    this.news = this.news.filter(n => n.id !== id);
    this.saveToStorage();
  }

  markNewsRead(id: number) {
    const item = this.news.find(n => n.id === id);
    if (item) {
      item.is_read = true;
      this.saveToStorage();
    }
  }

  getRequests() { 
    this.loadFromStorage();
    return [...this.requests].sort((a, b) => b.date.localeCompare(a.date)); 
  }
  
  createRequest(req: Omit<MockRequest, 'id' | 'status' | 'date'>) {
    const newReq: MockRequest = {
      ...req,
      id: Date.now(),
      status: 'pending',
      date: new Date().toISOString().slice(0, 16)
    };
    this.requests.push(newReq);
    this.saveToStorage();
    return newReq;
  }

  replyToRequest(id: number, responseMsg: string, attachment?: string) {
    const req = this.requests.find(r => r.id === id);
    if (req) {
      req.status = 'completed';
      req.response = {
        message: responseMsg,
        attachment,
        date: new Date().toISOString().slice(0, 16)
      };
      this.saveToStorage();
    }
  }

  deleteRequest(id: number) {
    this.requests = this.requests.filter(r => r.id !== id);
    this.saveToStorage();
  }

  resetData() {
    localStorage.removeItem(STORAGE_KEY);
    this.seedInitialData();
  }
}

export const mockBackend = new MockBackendService();