/**
 * Google Sheet / Webhook Sync Service for LCNS ERP Portal
 * Supports syncing users, applicants, courses, and CBT results with Google Sheets via VITE_SHEET_URL
 */

export interface SheetUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  phone?: string;
  level?: string;
  matricNo?: string;
  passwordHash?: string;
  createdAt: string;
}

export const SheetService = {
  getSheetUrl: (): string => {
    return (
      (import.meta.env.VITE_SHEET_URL as string) ||
      localStorage.getItem('lcns_sheet_url') ||
      ''
    );
  },

  setSheetUrl: (url: string) => {
    localStorage.setItem('lcns_sheet_url', url.trim());
  },

  syncUser: async (user: SheetUserPayload): Promise<boolean> => {
    const url = SheetService.getSheetUrl();
    if (!url) return false;

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // standard for Google Apps Script Web App endpoints
        body: JSON.stringify({
          action: 'CREATE_OR_UPDATE_USER',
          timestamp: new Date().toISOString(),
          ...user,
        }),
      });
      return true;
    } catch (err) {
      console.warn('Google Sheet user sync notice:', err);
      return false;
    }
  },

  syncApplication: async (applicantData: Record<string, any>): Promise<boolean> => {
    const url = SheetService.getSheetUrl();
    if (!url) return false;

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'NEW_APPLICATION',
          timestamp: new Date().toISOString(),
          ...applicantData,
        }),
      });
      return true;
    } catch (err) {
      console.warn('Google Sheet application sync notice:', err);
      return false;
    }
  },

  syncCBTResult: async (resultData: Record<string, any>): Promise<boolean> => {
    const url = SheetService.getSheetUrl();
    if (!url) return false;

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'CBT_RESULT',
          timestamp: new Date().toISOString(),
          ...resultData,
        }),
      });
      return true;
    } catch (err) {
      console.warn('Google Sheet CBT sync notice:', err);
      return false;
    }
  },

  syncCourse: async (courseData: Record<string, any>): Promise<boolean> => {
    const url = SheetService.getSheetUrl();
    if (!url) return false;

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'SAVE_COURSE',
          timestamp: new Date().toISOString(),
          ...courseData,
        }),
      });
      return true;
    } catch (err) {
      console.warn('Google Sheet course sync notice:', err);
      return false;
    }
  },
};
