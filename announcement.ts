export type AnnouncementType = 'announcement' | 'event' | 'admission' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  isActive: boolean;
  showInMarquee: boolean;
  createdAt: string;
  expiryDate?: string;
}
