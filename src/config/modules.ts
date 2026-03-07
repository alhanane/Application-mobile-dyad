export type ModuleId = 
  | 'home' 
  | 'info' 
  | 'news' 
  | 'schedule' 
  | 'attendance' 
  | 'homework' 
  | 'tracking' 
  | 'grades' 
  | 'skills' 
  | 'resources' 
  | 'messages' 
  | 'suggestions' 
  | 'transport' 
  | 'finance' 
  | 'photos' 
  | 'lost-found' 
  | 'shop' 
  | 'profile'
  | 'contact';

// Liste des modules activés pour le build actuel
// BUILD_01: Accueil + Info + Actualités + Mes demandes + Contact + Profil
export const ACTIVE_MODULES: ModuleId[] = [
  'home',
  'info',
  'news',
  'messages',
  'contact',
  'profile'
];

export const isModuleActive = (id: ModuleId): boolean => {
  return ACTIVE_MODULES.includes(id);
};