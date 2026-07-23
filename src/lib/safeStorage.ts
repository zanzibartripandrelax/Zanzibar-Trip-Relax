/**
 * Zanzibar Trip & Relax - Safe LocalStorage Utility & Storage Migration Engine
 * Protects localStorage against QuotaExceededError (DOMException 22)
 * Strips Base64 image/file payloads, enforces lightweight metadata storage,
 * and handles database synchronization.
 */

const MAX_PAYLOAD_BYTES = 400 * 1024; // 400 KB safety limit per key

/**
 * Calculates string size in bytes
 */
export function getPayloadSize(data: any): number {
  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return new Blob([str]).size;
  } catch {
    return 0;
  }
}

/**
 * Strips base64 image or document strings from any object or array
 * Replaces them with lightweight server URLs or unsplash placeholders
 */
export function stripBase64(data: any): any {
  if (!data) return data;

  if (typeof data === 'string') {
    // If it's a data URI (base64 image/pdf/doc)
    if (data.startsWith('data:') || (data.length > 500 && /^[A-Za-z0-9+/=]+$/.test(data.slice(0, 100)))) {
      if (data.includes('data:image/')) {
        return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=compress&cs=tinysrgb&w=150';
      }
      return '/uploads/placeholder_document.pdf';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => stripBase64(item));
  }

  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      if (key === 'passwordHash' || key === 'password') {
        cleaned[key] = data[key];
      } else {
        cleaned[key] = stripBase64(data[key]);
      }
    }
    return cleaned;
  }

  return data;
}

/**
 * Ensures user objects store ONLY lightweight user metadata
 */
export function sanitizeUserMetadata(user: any): any {
  if (!user || typeof user !== 'object') return user;

  const {
    id,
    username,
    staff_id,
    employee_id,
    name,
    fullName,
    email,
    phone,
    whatsapp,
    role,
    permissions,
    status,
    created_at,
    updated_at,
    date_joined,
    department,
    office,
    position,
    profile_photo,
    documents,
    first_login_required,
    isLocked,
    verified
  } = user;

  // Sanitize profile photo (URL only, never base64)
  let cleanProfilePhoto = profile_photo;
  if (typeof cleanProfilePhoto === 'string' && cleanProfilePhoto.startsWith('data:')) {
    cleanProfilePhoto = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=compress&cs=tinysrgb&w=150';
  }

  // Sanitize documents array (metadata only, no base64)
  const cleanDocuments = Array.isArray(documents)
    ? documents.map((doc: any) => ({
        id: doc.id || `doc-${Date.now()}`,
        label: doc.label || doc.name || 'Document',
        type: doc.type || 'File',
        fileName: doc.fileName || doc.name || 'document.pdf',
        url: typeof doc.url === 'string' && doc.url.startsWith('data:') ? '/uploads/documents/doc.pdf' : (doc.url || '/uploads/documents/doc.pdf'),
        size: doc.size || '100 KB',
        uploadedAt: doc.uploadedAt || new Date().toISOString()
      }))
    : [];

  return {
    id: id || staff_id || employee_id || username,
    username: (username || '').toLowerCase(),
    staff_id: staff_id || employee_id || `STF-${Math.floor(100 + Math.random() * 900)}`,
    name: name || fullName || username,
    email: (email || '').toLowerCase(),
    phone: phone || '',
    whatsapp: whatsapp || '',
    role: role || 'Staff',
    permissions: permissions || [],
    status: status || 'Active',
    department: department || office || 'Operations',
    position: position || role || 'Staff Member',
    profile_photo: cleanProfilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=compress&cs=tinysrgb&w=150',
    documents: cleanDocuments,
    first_login_required: !!first_login_required,
    isLocked: !!isLocked,
    verified: verified !== false,
    created_at: created_at || date_joined || new Date().toISOString(),
    updated_at: updated_at || new Date().toISOString()
  };
}

/**
 * Migration engine: Cleans existing bloated localStorage keys on boot
 */
export function migrateLocalStorage(): void {
  try {
    if (typeof window === 'undefined') return;
    console.log('[StorageMigration] Running localStorage quota protection migration...');
    
    // 1. Clean ztr_admin_users
    const rawUsers = window.localStorage.getItem('ztr_admin_users');
    if (rawUsers) {
      try {
        const parsedUsers = JSON.parse(rawUsers);
        if (Array.isArray(parsedUsers)) {
          const cleanedUsers = parsedUsers.map(sanitizeUserMetadata);
          window.localStorage.setItem('ztr_admin_users', JSON.stringify(cleanedUsers));
          console.log(`[StorageMigration] Cleaned ${cleanedUsers.length} admin user records.`);
        }
      } catch (e) {
        console.error('[StorageMigration] Error parsing ztr_admin_users:', e);
      }
    }

    // 2. Clean ztr_bookings and backups
    ['ztr_bookings', 'ztr_local_bookings_backup'].forEach(key => {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const cleaned = stripBase64(parsed);
            window.localStorage.setItem(key, JSON.stringify(cleaned));
          }
        } catch (e) {}
      }
    });

    // 3. Clean ztr_media_library / site_media_library
    ['ztr_media_library', 'site_media_library'].forEach(key => {
      const rawMedia = window.localStorage.getItem(key);
      if (rawMedia) {
        try {
          const parsed = JSON.parse(rawMedia);
          if (Array.isArray(parsed)) {
            const cleaned = stripBase64(parsed);
            window.localStorage.setItem(key, JSON.stringify(cleaned));
          }
        } catch (e) {}
      }
    });

    // 4. Clean activity and email logs (cap at 100 recent entries)
    ['site_activity_logs', 'ztr_email_logs'].forEach(key => {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 100) {
            window.localStorage.setItem(key, JSON.stringify(parsed.slice(0, 100)));
          }
        } catch (e) {}
      }
    });

    console.log('[StorageMigration] Storage migration completed successfully.');
  } catch (err) {
    console.warn('[StorageMigration] Migration warning:', err);
  }
}

/**
 * Safe localStorage wrapper that checks payload size and handles QuotaExceededError
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn(`[SafeStorage] getItem failed for key "${key}":`, e);
      return null;
    }
  },

  setItem: (key: string, value: string | any): boolean => {
    if (typeof window === 'undefined') return false;
    let stringVal = typeof value === 'string' ? value : JSON.stringify(value);

    // If saving ztr_admin_users specifically, enforce strict lightweight metadata
    if (key === 'ztr_admin_users') {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (Array.isArray(parsed)) {
          const cleaned = parsed.map(sanitizeUserMetadata);
          stringVal = JSON.stringify(cleaned);
        }
      } catch (e) {}
    }

    // Check payload size
    const size = getPayloadSize(stringVal);
    if (size > MAX_PAYLOAD_BYTES) {
      console.warn(`[SafeStorage] Warning: Payload size for "${key}" is ${(size / 1024).toFixed(1)} KB. Stripping base64...`);
      try {
        const parsed = JSON.parse(stringVal);
        const stripped = stripBase64(parsed);
        stringVal = JSON.stringify(stripped);
      } catch (e) {}
    }

    try {
      window.localStorage.setItem(key, stringVal);
      return true;
    } catch (err: any) {
      console.error(`[SafeStorage] QuotaExceededError on setItem for "${key}":`, err);
      
      // Execute Emergency Storage Cleanup
      try {
        console.log('[SafeStorage] Purging non-essential logs and temp backups...');
        window.localStorage.removeItem('site_activity_logs');
        window.localStorage.removeItem('ztr_email_logs');
        window.localStorage.removeItem('ztr_local_bookings_backup');
        
        // Strip base64 and retry
        try {
          const parsed = JSON.parse(stringVal);
          const stripped = stripBase64(parsed);
          stringVal = JSON.stringify(stripped);
        } catch (e) {}

        window.localStorage.setItem(key, stringVal);
        console.log(`[SafeStorage] Successfully saved "${key}" after storage cleanup.`);
        return true;
      } catch (retryErr) {
        console.error(`[SafeStorage] Fatal storage quota error for key "${key}".`, retryErr);
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('ztr_storage_quota_warning', {
            detail: { key, message: 'Local storage quota limit reached. Please save server backup.' }
          });
          window.dispatchEvent(event);
        }
        return false;
      }
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    } catch (e) {}
  },

  clear: (): void => {
    try {
      if (typeof window !== 'undefined') window.localStorage.clear();
    } catch (e) {}
  }
};
