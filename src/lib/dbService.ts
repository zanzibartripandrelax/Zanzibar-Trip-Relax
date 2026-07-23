/**
 * Database Service Layer
 * Replaces localStorage with backend REST API calls backed by persistent JSON storage on Express server.
 * Uses safeLocalStorage as a lightweight secondary cache fallback.
 */

import { safeLocalStorage, sanitizeUserMetadata } from './safeStorage';

// Staff / Users DB API
export async function fetchStaffUsers(): Promise<any[]> {
  try {
    const res = await fetch('/api/auth/staff');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.staff)) {
        const cleaned = data.staff.map(sanitizeUserMetadata);
        safeLocalStorage.setItem('ztr_admin_users', cleaned);
        return cleaned;
      }
    }
  } catch (err) {
    console.warn('[DbService] Failed to fetch staff from server, reading cache:', err);
  }

  // Local cache fallback
  const cached = safeLocalStorage.getItem('ztr_admin_users');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      return Array.isArray(parsed) ? parsed.map(sanitizeUserMetadata) : [];
    } catch (e) {}
  }
  return [];
}

export async function saveStaffUserToServer(userData: any): Promise<boolean> {
  const cleanUser = sanitizeUserMetadata(userData);
  try {
    const res = await fetch('/api/auth/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: cleanUser.name,
        username: cleanUser.username,
        temporaryPassword: cleanUser.password || 'Zanzibar2026!',
        phone: cleanUser.phone,
        email: cleanUser.email,
        role: cleanUser.role,
        department: cleanUser.department
      })
    });
    if (res.ok) {
      console.log('[DbService] Staff user saved on server.');
    }
  } catch (err) {
    console.warn('[DbService] Failed to post staff user to server:', err);
  }

  // Update local cache safely
  const current = await fetchStaffUsers();
  const existsIndex = current.findIndex((u: any) => u.username.toLowerCase() === cleanUser.username.toLowerCase());
  const updated = [...current];
  if (existsIndex >= 0) {
    updated[existsIndex] = cleanUser;
  } else {
    updated.push(cleanUser);
  }
  return safeLocalStorage.setItem('ztr_admin_users', updated);
}

// Bookings DB API
export async function fetchBookingsData(): Promise<any[]> {
  try {
    const res = await fetch('/api/bookings');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        safeLocalStorage.setItem('ztr_bookings', data.bookings);
        return data.bookings;
      }
    }
  } catch (err) {
    console.warn('[DbService] Failed to fetch bookings from server:', err);
  }

  const cached = safeLocalStorage.getItem('ztr_bookings') || safeLocalStorage.getItem('ztr_local_bookings_backup');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  return [];
}

export async function saveBookingsToServer(bookings: any[]): Promise<boolean> {
  try {
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookings })
    });
  } catch (err) {
    console.warn('[DbService] Failed to sync bookings to server:', err);
  }
  return safeLocalStorage.setItem('ztr_bookings', bookings);
}

// Customers DB API
export async function fetchCustomersData(): Promise<any[]> {
  try {
    const res = await fetch('/api/customers');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        safeLocalStorage.setItem('ztr_customers', data.customers);
        return data.customers;
      }
    }
  } catch (err) {
    console.warn('[DbService] Failed to fetch customers:', err);
  }

  const cached = safeLocalStorage.getItem('ztr_customers');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  return [];
}

export async function saveCustomersToServer(customers: any[]): Promise<boolean> {
  try {
    await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customers })
    });
  } catch (err) {
    console.warn('[DbService] Failed to save customers to server:', err);
  }
  return safeLocalStorage.setItem('ztr_customers', customers);
}

// Documents DB API
export async function fetchDocumentsData(): Promise<any[]> {
  try {
    const res = await fetch('/api/documents');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.documents)) {
        safeLocalStorage.setItem('ztr_documents', data.documents);
        return data.documents;
      }
    }
  } catch (err) {
    console.warn('[DbService] Failed to fetch documents:', err);
  }

  const cached = safeLocalStorage.getItem('ztr_documents');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  return [];
}

export async function saveDocumentsToServer(documents: any[]): Promise<boolean> {
  try {
    await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documents })
    });
  } catch (err) {
    console.warn('[DbService] Failed to save documents to server:', err);
  }
  return safeLocalStorage.setItem('ztr_documents', documents);
}

// Reports DB API
export async function fetchReportsData(): Promise<any[]> {
  try {
    const res = await fetch('/api/reports');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.reports)) {
        safeLocalStorage.setItem('ztr_reports', data.reports);
        return data.reports;
      }
    }
  } catch (err) {
    console.warn('[DbService] Failed to fetch reports:', err);
  }

  const cached = safeLocalStorage.getItem('ztr_reports');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  return [];
}

export async function saveReportsToServer(reports: any[]): Promise<boolean> {
  try {
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reports })
    });
  } catch (err) {
    console.warn('[DbService] Failed to save reports to server:', err);
  }
  return safeLocalStorage.setItem('ztr_reports', reports);
}
