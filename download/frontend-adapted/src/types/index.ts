/**
 * Types TypeScript - Institution AL HANANE
 * Définitions des types pour l'API
 */

// ============================================
// UTILISATEURS
// ============================================

export interface Parent {
  id: number;
  login: string;
  first_name: string;
  last_name: string;
  email: string | null;
  gsm: string | null;
  avatar_url: string | null;
  first_login_at: number | null;
  last_login_at: number | null;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  birth_date: string | null;
  gender: 'M' | 'F' | null;
  level_id: number;
  class_id: number;
  level_code: string;
  level_name: string;
  class_code: string;
  class_name: string;
  full_class: string;
  relationship: 'pere' | 'mere' | 'tuteur' | 'autre';
  is_primary: boolean;
}

// ============================================
// CONTENUS
// ============================================

export interface InfoNote {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  pdf_url: string | null;
  pdf_filename: string | null;
  link_url: string | null;
  target_type: 'all' | 'level' | 'class';
  published_at: number;
  is_pinned: boolean;
  category_label: string | null;
  category_color: string | null;
  is_read: boolean;
  read_at: number | null;
}

export interface News {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  pdf_url: string | null;
  pdf_filename: string | null;
  link_url: string | null;
  target_type: 'all' | 'level' | 'class';
  published_at: number;
  is_pinned: boolean;
  category_label: string | null;
  category_color: string | null;
  is_read: boolean;
  read_at: number | null;
}

// ============================================
// DEMANDES
// ============================================

export interface RequestType {
  id: number;
  code: string;
  label: string;
  description: string | null;
}

export interface Request {
  id: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  message: string;
  subject: string | null;
  priority: 'low' | 'normal' | 'high';
  created_at: number;
  updated_at: number;
  completed_at: number | null;
  type_code: string;
  type_label: string;
  student_id: number;
  student_first_name: string;
  student_last_name: string;
  level_code: string;
  class_code: string;
  student_class: string;
  responses_count: number;
}

export interface RequestResponse {
  id: number;
  message: string;
  attachment_url: string | null;
  attachment_filename: string | null;
  created_at: number;
}

export interface RequestDetail extends Request {
  responses: RequestResponse[];
}

// ============================================
// CONTACT
// ============================================

export interface ContactInfo {
  id: number;
  school_name: string;
  phone: string;
  phone_2: string | null;
  fax: string | null;
  email: string;
  website: string | null;
  address: string;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  working_hours: string | null;
}

// ============================================
// NOTIFICATIONS
// ============================================

export interface DeviceToken {
  token: string;
  platform: 'android' | 'ios' | 'web';
  device_name?: string;
  device_model?: string;
  os_version?: string;
  app_version?: string;
}

// ============================================
// RÉPONSES API
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface LoginResponse {
  parent: Parent;
  children: Student[];
}

export interface InfoListResponse {
  notes: InfoNote[];
}

export interface NewsListResponse {
  news: News[];
}

export interface RequestsListResponse {
  requests: Request[];
}

export interface RequestDetailResponse {
  request: RequestDetail;
  responses: RequestResponse[];
}

export interface RequestTypesResponse {
  types: RequestType[];
}

export interface StudentsResponse {
  students: Student[];
}
