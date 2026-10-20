import { Announcement } from '../types/announcement';

const KEY = 'lcns_announcements';

export const AnnouncementService = {
  getAll(): Announcement[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch { return []; }
  },
  getActive(): Announcement[] {
    return this.getAll().filter(a => a.isActive);
  },
  getMarquee(): Announcement[] {
    return this.getAll().filter(a => a.isActive && a.showInMarquee);
  },
  saveAll(list: Announcement[]) {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('announcements-updated'));
  },
  create(title: string, message: string, type: any, showInMarquee: boolean) {
    const list = this.getAll();
    const newItem: Announcement = {
      id: 'ANC-' + Date.now(),
      title,
      message,
      type,
      isActive: true,
      showInMarquee,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newItem);
    this.saveAll(list);
  },
  delete(id: string) {
    const list = this.getAll().filter(a => a.id !== id);
    this.saveAll(list);
  },
  toggle(id: string) {
    const list = this.getAll().map(a => a.id === id ? {...a, isActive: !a.isActive} : a);
    this.saveAll(list);
  }
};
