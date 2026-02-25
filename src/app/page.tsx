'use client'

import { useState } from 'react'

// ============================================
// TYPES
// ============================================
type TargetType = 'all' | 'level' | 'class'
type RequestStatus = 'pending' | 'completed'
type RequestType = 'attestation' | 'facture' | 'certificat' | 'autre'

interface Level {
  id: number
  code: string
  name: string
}

interface Class {
  id: number
  level_id: number
  code: string
  name: string
  level_code: string
}

// ============================================
// DATA
// ============================================
const LEVELS: Level[] = [
  { id: 1, code: 'CP', name: 'Cours Préparatoire' },
  { id: 2, code: 'CE1', name: 'Cours Élémentaire 1' },
  { id: 3, code: 'CE2', name: 'Cours Élémentaire 2' },
  { id: 4, code: 'CM1', name: 'Cours Moyen 1' },
  { id: 5, code: 'CM2', name: 'Cours Moyen 2' },
  { id: 6, code: '6eme', name: '6ème Année' },
]

const CLASSES: Class[] = [
  { id: 1, level_id: 1, code: 'A', name: 'CP A', level_code: 'CP' },
  { id: 2, level_id: 1, code: 'B', name: 'CP B', level_code: 'CP' },
  { id: 3, level_id: 1, code: 'C', name: 'CP C', level_code: 'CP' },
  { id: 4, level_id: 2, code: 'A', name: 'CE1 A', level_code: 'CE1' },
  { id: 5, level_id: 2, code: 'B', name: 'CE1 B', level_code: 'CE1' },
  { id: 6, level_id: 3, code: 'A', name: 'CE2 A', level_code: 'CE2' },
  { id: 7, level_id: 3, code: 'B', name: 'CE2 B', level_code: 'CE2' },
  { id: 8, level_id: 4, code: 'A', name: 'CM1 A', level_code: 'CM1' },
  { id: 9, level_id: 4, code: 'B', name: 'CM1 B', level_code: 'CM1' },
  { id: 10, level_id: 5, code: 'A', name: 'CM2 A', level_code: 'CM2' },
  { id: 11, level_id: 5, code: 'B', name: 'CM2 B', level_code: 'CM2' },
  { id: 12, level_id: 6, code: 'A', name: '6ème A', level_code: '6eme' },
]

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminPanel() {
  const [view, setView] = useState<'login' | 'dashboard' | 'info' | 'news' | 'requests' | 'reply'>('login')
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  
  // Form states
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  // Info Note form
  const [infoTitle, setInfoTitle] = useState('')
  const [infoDesc, setInfoDesc] = useState('')
  const [infoTarget, setInfoTarget] = useState<TargetType>('all')
  const [infoLevelId, setInfoLevelId] = useState(0)
  const [infoClassId, setInfoClassId] = useState(0)
  
  // News form
  const [newsTitle, setNewsTitle] = useState('')
  const [newsDesc, setNewsDesc] = useState('')
  const [newsCategory, setNewsCategory] = useState('Information')
  const [newsTarget, setNewsTarget] = useState<TargetType>('all')
  const [newsLevelId, setNewsLevelId] = useState(0)
  const [newsClassId, setNewsClassId] = useState(0)
  
  // Data states
  const [infoNotes, setInfoNotes] = useState([
    { id: 1, title: 'Réunion parents-profs', description: 'Une réunion parents-profs aura lieu le 15 janvier 2025 à 10h.', target_type: 'all' as TargetType, published_at: '2025-01-05' },
    { id: 2, title: 'Sortie scolaire CP', description: 'Sortie pédagogique au musée pour les CP.', target_type: 'level' as TargetType, level_code: 'CP', published_at: '2025-01-06' },
  ])
  
  const [newsList, setNewsList] = useState([
    { id: 1, title: 'Fête de fin d\'année', description: 'L\'école organise une grande fête.', category: 'Événement', target_type: 'all' as TargetType, published_at: '2025-01-04' },
  ])
  
  const [requests, setRequests] = useState([
    { id: 1, parent_name: 'Ahmed Benali', student_name: 'Karim Benali', student_class: 'CP/A', type: 'attestation' as RequestType, message: 'J\'ai besoin d\'une attestation d\'inscription.', status: 'pending' as RequestStatus, created_at: '2025-01-05' },
    { id: 2, parent_name: 'Fatima Zahra', student_name: 'Omar Zahra', student_class: 'CE1/A', type: 'certificat' as RequestType, message: 'Certificat de scolarité demandé.', status: 'completed' as RequestStatus, created_at: '2025-01-04' },
    { id: 3, parent_name: 'Mohammed Alami', student_name: 'Lina Alami', student_class: 'CE2/A', type: 'facture' as RequestType, message: 'Facture de décembre manquante.', status: 'pending' as RequestStatus, created_at: '2025-01-06' },
  ])
  
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'completed'>('pending')
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  
  const [deviceCount] = useState(5)

  // Helper functions
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'admin' && password === 'admin123') {
      setView('dashboard')
      showToast('Connexion réussie !', 'success')
    } else {
      showToast('Identifiants incorrects. Utilisez admin / admin123', 'error')
    }
  }

  const handleCreateInfoNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!infoTitle || !infoDesc) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error')
      return
    }
    
    const levelCode = infoTarget === 'level' ? LEVELS.find(l => l.id === infoLevelId)?.code : null
    
    setInfoNotes(prev => [{
      id: prev.length + 1,
      title: infoTitle,
      description: infoDesc,
      target_type: infoTarget,
      level_code: levelCode,
      published_at: new Date().toISOString().split('T')[0]
    }, ...prev])
    
    setInfoTitle('')
    setInfoDesc('')
    setInfoTarget('all')
    setInfoLevelId(0)
    setInfoClassId(0)
    
    showToast('Note publiée ! Notification FCM envoyée.', 'success')
    setView('dashboard')
  }

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsTitle || !newsDesc) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error')
      return
    }
    
    setNewsList(prev => [{
      id: prev.length + 1,
      title: newsTitle,
      description: newsDesc,
      category: newsCategory,
      target_type: newsTarget,
      published_at: new Date().toISOString().split('T')[0]
    }, ...prev])
    
    setNewsTitle('')
    setNewsDesc('')
    setNewsCategory('Information')
    setNewsTarget('all')
    setNewsLevelId(0)
    setNewsClassId(0)
    
    showToast('Actualité publiée ! Notification FCM envoyée.', 'success')
    setView('dashboard')
  }

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim()) {
      showToast('Veuillez entrer un message', 'error')
      return
    }
    
    setRequests(prev => prev.map(r => 
      r.id === selectedRequest ? { ...r, status: 'completed' as RequestStatus } : r
    ))
    
    setReplyMessage('')
    setSelectedRequest(null)
    showToast('Réponse envoyée ! Notification FCM envoyée au parent.', 'success')
    setView('requests')
  }

  const filteredRequests = requests.filter(r => requestFilter === 'all' || r.status === requestFilter)
  const selectedReq = requests.find(r => r.id === selectedRequest)

  const getTypeLabel = (type: RequestType) => {
    const labels = { attestation: 'Attestation', facture: 'Facture', certificat: 'Certificat', autre: 'Autre' }
    return labels[type]
  }

  const filteredClasses = CLASSES.filter(c => infoLevelId === 0 || c.level_id === infoLevelId)
  const filteredNewsClasses = CLASSES.filter(c => newsLevelId === 0 || c.level_id === newsLevelId)

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={{ minHeight: '100vh', background: '#F6F5FF' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 1000,
          background: toast.type === 'success' ? '#166534' : '#DC2626',
          color: 'white', padding: '1rem 1.5rem', borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          {toast.message}
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>
      )}

      {/* LOGIN VIEW */}
      {view === 'login' && (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #F6F5FF 0%, #E8E6FF 100%)', padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 24, padding: '2.5rem',
            boxShadow: '0 25px 50px rgba(30, 27, 75, 0.15)', maxWidth: 400, width: '100%'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16, margin: '0 auto 1rem',
                background: 'linear-gradient(135deg, #5B56F6, #7C3AED)'
              }} />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E1B4B', margin: 0 }}>
                Back-Office Admin
              </h1>
              <p style={{ color: '#6B7280', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Institution Al Hanane - Application Mobile
              </p>
            </div>
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                  Nom d&apos;utilisateur
                </label>
                <input
                  type="text" value={username} onChange={e => setUsername(e.target.value)}
                  style={{
                    width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                    fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                  }}
                  placeholder="admin"
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                  Mot de passe
                </label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                    fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                  }}
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" style={{
                width: '100%', padding: '1rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #5B56F6, #7C3AED)', color: 'white',
                fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
              }}>
                Se connecter
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#9CA3AF' }}>
              Identifiants de test: <strong>admin</strong> / <strong>admin123</strong>
            </p>
          </div>
        </div>
      )}

      {/* ADMIN VIEWS */}
      {view !== 'login' && (
        <>
          {/* Header */}
          <header style={{
            background: 'white', borderBottom: '1px solid rgba(30,27,75,0.1)',
            padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #5B56F6, #7C3AED)'
              }} />
              <div>
                <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B', margin: 0 }}>
                  Back-Office Admin
                </h1>
                <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
                  Build 01 — Notes, Actus, Demandes
                </p>
              </div>
            </div>
            <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { key: 'dashboard', label: 'Dashboard' },
                { key: 'info', label: 'Créer Note' },
                { key: 'news', label: 'Créer Actu' },
                { key: 'requests', label: 'Demandes' },
              ].map(item => (
                <button key={item.key} onClick={() => setView(item.key as typeof view)} style={{
                  padding: '0.5rem 1rem', borderRadius: 999, border: 'none',
                  background: view === item.key ? 'rgba(91,86,246,0.1)' : 'transparent',
                  color: view === item.key ? '#5B56F6' : '#374151',
                  fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer'
                }}>
                  {item.label}
                </button>
              ))}
              <button onClick={() => { setView('login'); setUsername(''); setPassword(''); }} style={{
                padding: '0.5rem 1rem', borderRadius: 999, border: 'none',
                background: '#FEE2E2', color: '#DC2626',
                fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer'
              }}>
                Déconnexion
              </button>
            </nav>
          </header>

          {/* Main Content */}
          <main style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>
            
            {/* DASHBOARD */}
            {view === 'dashboard' && (
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E1B4B', marginBottom: '0.5rem' }}>
                  Dashboard
                </h1>
                <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
                  Bienvenue dans le back-office de l&apos;application mobile Al Hanane
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>Notes d&apos;information</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#5B56F6', margin: '0.5rem 0 0' }}>{infoNotes.length}</p>
                  </div>
                  <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>Actualités</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#7C3AED', margin: '0.5rem 0 0' }}>{newsList.length}</p>
                  </div>
                  <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>Demandes en attente</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#F59E0B', margin: '0.5rem 0 0' }}>{requests.filter(r => r.status === 'pending').length}</p>
                  </div>
                  <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>Demandes traitées</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#22C55E', margin: '0.5rem 0 0' }}>{requests.filter(r => r.status === 'completed').length}</p>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1E1B4B', marginBottom: '0.75rem' }}>
                    Notifications FCM
                  </h2>
                  <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
                    Tokens FCM actifs: <strong>{deviceCount}</strong> appareils enregistrés
                  </p>
                  <div style={{
                    padding: '0.75rem 1rem', background: deviceCount > 0 ? '#ECFDF5' : '#FEF3C7',
                    borderRadius: 8, color: deviceCount > 0 ? '#065F46' : '#92400E', fontSize: '0.875rem'
                  }}>
                    {deviceCount > 0 
                      ? '✓ FCM configuré - Les notifications seront envoyées aux appareils enregistrés'
                      : '⚠ Configurez FCM_SERVER_KEY pour activer les notifications push'}
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1E1B4B', marginBottom: '1rem' }}>
                    Actions rapides
                  </h2>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setView('info')} style={{
                      padding: '0.875rem 1.5rem', borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, #5B56F6, #7C3AED)', color: 'white',
                      fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
                    }}>
                      + Créer une note
                    </button>
                    <button onClick={() => setView('news')} style={{
                      padding: '0.875rem 1.5rem', borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, #5B56F6, #7C3AED)', color: 'white',
                      fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
                    }}>
                      + Créer une actualité
                    </button>
                    <button onClick={() => setView('requests')} style={{
                      padding: '0.875rem 1.5rem', borderRadius: 12, border: '2px solid #E5E7EB',
                      background: 'white', color: '#374151', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
                    }}>
                      Voir les demandes ({requests.filter(r => r.status === 'pending').length} en attente)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CREATE INFO NOTE */}
            {view === 'info' && (
              <div>
                <button onClick={() => setView('dashboard')} style={{
                  padding: '0.5rem 1rem', borderRadius: 8, border: 'none',
                  background: '#F3F4F6', color: '#374151', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1.5rem'
                }}>
                  ← Retour au dashboard
                </button>
                
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E1B4B', marginBottom: '0.5rem' }}>
                  Créer une Note d&apos;information
                </h1>
                <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
                  Publiez une note et envoyez une notification FCM aux parents ciblés
                </p>

                <form onSubmit={handleCreateInfoNote} style={{
                  background: 'white', borderRadius: 16, padding: '2rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                      Titre *
                    </label>
                    <input type="text" value={infoTitle} onChange={e => setInfoTitle(e.target.value)} style={{
                      width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                      fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                    }} placeholder="Titre de la note..." required />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                      Description *
                    </label>
                    <textarea value={infoDesc} onChange={e => setInfoDesc(e.target.value)} style={{
                      width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                      fontSize: '1rem', outline: 'none', minHeight: 150, resize: 'vertical', boxSizing: 'border-box'
                    }} placeholder="Contenu de la note..." required />
                  </div>

                  <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1B4B', marginBottom: '1rem' }}>
                      Ciblage des destinataires
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                          Type de ciblage
                        </label>
                        <select value={infoTarget} onChange={e => { setInfoTarget(e.target.value as TargetType); setInfoLevelId(0); setInfoClassId(0); }} style={{
                          width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                          fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                        }}>
                          <option value="all">Tous les parents</option>
                          <option value="level">Par niveau</option>
                          <option value="class">Par classe</option>
                        </select>
                      </div>
                      
                      {infoTarget === 'level' && (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Niveau</label>
                          <select value={infoLevelId} onChange={e => setInfoLevelId(Number(e.target.value))} style={{
                            width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                            fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                          }}>
                            <option value={0}>Sélectionner un niveau</option>
                            {LEVELS.map(l => <option key={l.id} value={l.id}>{l.code} - {l.name}</option>)}
                          </select>
                        </div>
                      )}
                      
                      {infoTarget === 'class' && (
                        <>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Niveau</label>
                            <select value={infoLevelId} onChange={e => { setInfoLevelId(Number(e.target.value)); setInfoClassId(0); }} style={{
                              width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                              fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                            }}>
                              <option value={0}>Sélectionner un niveau</option>
                              {LEVELS.map(l => <option key={l.id} value={l.id}>{l.code} - {l.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Classe</label>
                            <select value={infoClassId} onChange={e => setInfoClassId(Number(e.target.value))} style={{
                              width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                              fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                            }}>
                              <option value={0}>Sélectionner une classe</option>
                              {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.level_code}/{c.code} - {c.name}</option>)}
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" style={{
                      padding: '1rem 2rem', borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, #5B56F6, #7C3AED)', color: 'white',
                      fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
                    }}>
                      Publier & Envoyer notification
                    </button>
                    <button type="button" onClick={() => setView('dashboard')} style={{
                      padding: '1rem 2rem', borderRadius: 12, border: '2px solid #E5E7EB',
                      background: 'white', color: '#374151', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
                    }}>
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* CREATE NEWS */}
            {view === 'news' && (
              <div>
                <button onClick={() => setView('dashboard')} style={{
                  padding: '0.5rem 1rem', borderRadius: 8, border: 'none',
                  background: '#F3F4F6', color: '#374151', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1.5rem'
                }}>
                  ← Retour au dashboard
                </button>
                
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E1B4B', marginBottom: '0.5rem' }}>
                  Créer une Actualité
                </h1>
                <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
                  Publiez une actualité et envoyez une notification FCM aux parents ciblés
                </p>

                <form onSubmit={handleCreateNews} style={{
                  background: 'white', borderRadius: 16, padding: '2rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Titre *</label>
                      <input type="text" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} style={{
                        width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                        fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                      }} placeholder="Titre de l'actualité..." required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Catégorie</label>
                      <select value={newsCategory} onChange={e => setNewsCategory(e.target.value)} style={{
                        width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                        fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                      }}>
                        <option value="Information">Information</option>
                        <option value="Événement">Événement</option>
                        <option value="Pédagogie">Pédagogie</option>
                        <option value="Sport">Sport</option>
                        <option value="Culture">Culture</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Description *</label>
                    <textarea value={newsDesc} onChange={e => setNewsDesc(e.target.value)} style={{
                      width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                      fontSize: '1rem', outline: 'none', minHeight: 150, resize: 'vertical', boxSizing: 'border-box'
                    }} placeholder="Contenu de l'actualité..." required />
                  </div>

                  <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1B4B', marginBottom: '1rem' }}>Ciblage des destinataires</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Type de ciblage</label>
                        <select value={newsTarget} onChange={e => { setNewsTarget(e.target.value as TargetType); setNewsLevelId(0); setNewsClassId(0); }} style={{
                          width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                          fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                        }}>
                          <option value="all">Tous les parents</option>
                          <option value="level">Par niveau</option>
                          <option value="class">Par classe</option>
                        </select>
                      </div>
                      
                      {newsTarget === 'level' && (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Niveau</label>
                          <select value={newsLevelId} onChange={e => setNewsLevelId(Number(e.target.value))} style={{
                            width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                            fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                          }}>
                            <option value={0}>Sélectionner un niveau</option>
                            {LEVELS.map(l => <option key={l.id} value={l.id}>{l.code} - {l.name}</option>)}
                          </select>
                        </div>
                      )}
                      
                      {newsTarget === 'class' && (
                        <>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Niveau</label>
                            <select value={newsLevelId} onChange={e => { setNewsLevelId(Number(e.target.value)); setNewsClassId(0); }} style={{
                              width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                              fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                            }}>
                              <option value={0}>Sélectionner un niveau</option>
                              {LEVELS.map(l => <option key={l.id} value={l.id}>{l.code} - {l.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Classe</label>
                            <select value={newsClassId} onChange={e => setNewsClassId(Number(e.target.value))} style={{
                              width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                              fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                            }}>
                              <option value={0}>Sélectionner une classe</option>
                              {filteredNewsClasses.map(c => <option key={c.id} value={c.id}>{c.level_code}/{c.code} - {c.name}</option>)}
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" style={{
                      padding: '1rem 2rem', borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, #5B56F6, #7C3AED)', color: 'white',
                      fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
                    }}>
                      Publier & Envoyer notification
                    </button>
                    <button type="button" onClick={() => setView('dashboard')} style={{
                      padding: '1rem 2rem', borderRadius: 12, border: '2px solid #E5E7EB',
                      background: 'white', color: '#374151', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
                    }}>
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* REQUESTS LIST */}
            {view === 'requests' && (
              <div>
                <button onClick={() => setView('dashboard')} style={{
                  padding: '0.5rem 1rem', borderRadius: 8, border: 'none',
                  background: '#F3F4F6', color: '#374151', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1.5rem'
                }}>
                  ← Retour au dashboard
                </button>
                
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E1B4B', marginBottom: '0.5rem' }}>
                  Demandes des parents
                </h1>
                <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
                  Gérez les demandes des parents et répondez avec notification FCM
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {(['pending', 'completed', 'all'] as const).map(status => (
                    <button key={status} onClick={() => setRequestFilter(status)} style={{
                      padding: '0.75rem 1.25rem', borderRadius: 12,
                      border: requestFilter === status ? 'none' : '2px solid #E5E7EB',
                      background: requestFilter === status ? 'linear-gradient(135deg, #5B56F6, #7C3AED)' : 'white',
                      color: requestFilter === status ? 'white' : '#374151',
                      fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer'
                    }}>
                      {status === 'pending' ? 'En attente' : status === 'completed' ? 'Traitées' : 'Toutes'}
                      {' '}({requests.filter(r => status === 'all' || r.status === status).length})
                    </button>
                  ))}
                </div>

                <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>ID</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Statut</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Parent</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Élève</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Type</th>
                        <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map(r => (
                        <tr key={r.id} style={{ borderTop: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '1rem', fontWeight: 600, color: '#1E1B4B' }}>#{r.id}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.375rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 500,
                              background: r.status === 'completed' ? '#DCFCE7' : '#FEF3C7',
                              color: r.status === 'completed' ? '#166534' : '#92400E'
                            }}>
                              {r.status === 'completed' ? 'Traité' : 'En attente'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: '#374151' }}>{r.parent_name}</td>
                          <td style={{ padding: '1rem', color: '#374151' }}>
                            {r.student_name}
                            <br />
                            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{r.student_class}</span>
                          </td>
                          <td style={{ padding: '1rem', color: '#374151' }}>{getTypeLabel(r.type)}</td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <button onClick={() => { setSelectedRequest(r.id); setView('reply'); }} style={{
                              padding: '0.5rem 1rem', borderRadius: 8, border: 'none',
                              background: '#5B56F6', color: 'white', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer'
                            }}>
                              {r.status === 'completed' ? 'Voir' : 'Répondre'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredRequests.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                      Aucune demande trouvée
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* REQUEST REPLY */}
            {view === 'reply' && selectedReq && (
              <div>
                <button onClick={() => { setView('requests'); setSelectedRequest(null); }} style={{
                  padding: '0.5rem 1rem', borderRadius: 8, border: 'none',
                  background: '#F3F4F6', color: '#374151', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1.5rem'
                }}>
                  ← Retour aux demandes
                </button>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E1B4B', marginBottom: '0.5rem' }}>
                  Demande #{selectedReq.id}
                </h1>
                <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
                  Répondez à cette demande et envoyez une notification FCM au parent
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.75rem' }}>PARENT</h3>
                    <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>{selectedReq.parent_name}</p>
                  </div>
                  <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.75rem' }}>ÉLÈVE CONCERNÉ</h3>
                    <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>{selectedReq.student_name}</p>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>Classe: {selectedReq.student_class}</p>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>
                      Demande: {getTypeLabel(selectedReq.type)}
                    </h3>
                    <span style={{
                      padding: '0.375rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 500,
                      background: selectedReq.status === 'completed' ? '#DCFCE7' : '#FEF3C7',
                      color: selectedReq.status === 'completed' ? '#166534' : '#92400E'
                    }}>
                      {selectedReq.status === 'completed' ? 'Traité' : 'En attente'}
                    </span>
                  </div>
                  <p style={{ color: '#374151', lineHeight: 1.6 }}>{selectedReq.message}</p>
                </div>

                {selectedReq.status === 'pending' && (
                  <form onSubmit={handleReply} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1B4B', marginBottom: '1rem' }}>Votre réponse</h3>
                    <textarea value={replyMessage} onChange={e => setReplyMessage(e.target.value)} style={{
                      width: '100%', padding: '1rem', borderRadius: 12, border: '2px solid #E5E7EB',
                      fontSize: '1rem', outline: 'none', minHeight: 120, resize: 'vertical', boxSizing: 'border-box'
                    }} placeholder="Écrivez votre réponse..." required />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button type="submit" style={{
                        padding: '1rem 2rem', borderRadius: 12, border: 'none',
                        background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: 'white',
                        fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
                      }}>
                        Envoyer & Notifier le parent
                      </button>
                      <button type="button" onClick={() => { setView('requests'); setSelectedRequest(null); }} style={{
                        padding: '1rem 2rem', borderRadius: 12, border: '2px solid #E5E7EB',
                        background: 'white', color: '#374151', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
                      }}>
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </main>
        </>
      )}
    </div>
  )
}
