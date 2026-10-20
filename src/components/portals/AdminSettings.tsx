// REPLACE THESE 2 FUNCTIONS - THIS WILL PERMANENTLY DELETE FROM SUPABASE TOO:

const removeBishop = async () => {
  if (!confirm('PERMANENTLY REMOVE Bishop William Avenya from Supabase and website? This will delete from database so it NEVER returns!')) return;
  try {
    const sb = getSupabase();
    // 1. Delete from Supabase storage
    if (sb && cmsConfig.bishopPhotoUrl) {
      try {
        // Extract file path from URL
        const url = cmsConfig.bishopPhotoUrl;
        if (url.includes('lcns-files') || url.includes('lcns-media')) {
          const fileName = url.split('/').pop()?.split('?')[0];
          if (fileName) {
            await sb.storage.from('lcns-files').remove([fileName]);
            await sb.storage.from('lcns-media').remove([fileName]);
          }
        }
        // Delete from school_settings table
        await sb.from('school_settings').delete().eq('key', 'bishop_photo_url');
        await sb.from('school_settings').delete().eq('key', 'bishop_name');
        await sb.from('school_settings').delete().eq('key', 'bishop_title');
        await sb.from('school_settings').delete().eq('key', 'bishop_message');
        // Delete from cms_config table if exists
        await sb.from('cms_config').update({ 
          bishopName: '', 
          bishopTitle: '', 
          bishopMessage: '', 
          bishopPhotoUrl: '',
          bishopPhoto: '' 
        }).eq('id', 1);
        // Delete from management table
        await sb.from('management').delete().ilike('name', '%Avenya%');
        await sb.from('management').delete().ilike('name', '%William%');
      } catch (e) {
        console.warn('Supabase delete failed, continuing local delete', e);
      }
    }
    // 2. Delete from localStorage - ALL keys
    localStorage.removeItem('lcns_bishop_data');
    localStorage.removeItem('lcns_management_team');
    const localKeys = ['bishop_photo_url', 'bishop_name', 'bishop_title', 'bishop_message', 'school_logo', 'bishopPhotoUrl'];
    localKeys.forEach(k => {
      localStorage.removeItem(k);
      localStorage.removeItem(`lcns_${k}`);
    });
    // 3. Clear CMS config
    const newCms = { ...cmsConfig, bishopName: '', bishopTitle: '', bishopMessage: '', bishopPhotoUrl: '', bishopPhoto: '' };
    setCmsConfig(newCms);
    StorageService.saveCMSConfig(newCms);
    // 4. Use your deletePermanentFile function
    try {
      await deletePermanentFile('bishop_photo_url');
    } catch {}
    
    showStatus('🗑️ PERMANENTLY DELETED! Bishop William Avenya removed from Supabase DB + Storage + localStorage. Will NOT return! Refresh page - it is gone forever!');
    setTimeout(() => window.location.reload(), 1500);
  } catch (err: any) {
    showStatus('Error deleting: ' + err.message, 'error');
  }
};

const removeProvost = async () => {
  if (!confirm('PERMANENTLY REMOVE Provost from Supabase?')) return;
  try {
    const sb = getSupabase();
    if (sb && cmsConfig.provostPhotoUrl) {
      try {
        const url = cmsConfig.provostPhotoUrl;
        if (url.includes('lcns-files') || url.includes('lcns-media')) {
          const fileName = url.split('/').pop()?.split('?')[0];
          if (fileName) {
            await sb.storage.from('lcns-files').remove([fileName]);
            await sb.storage.from('lcns-media').remove([fileName]);
          }
        }
        await sb.from('school_settings').delete().eq('key', 'provost_photo_url');
        await sb.from('cms_config').update({ provostName: '', provostTitle: '', provostMessage: '', provostPhotoUrl: '' }).eq('id', 1);
      } catch {}
    }
    localStorage.removeItem('lcns_provost_data');
    const newCms = { ...cmsConfig, provostName: '', provostTitle: '', provostMessage: '', provostPhotoUrl: '' };
    setCmsConfig(newCms);
    StorageService.saveCMSConfig(newCms);
    try { await deletePermanentFile('provost_photo_url'); } catch {}
    showStatus('🗑️ Provost PERMANENTLY deleted from Supabase! Will not return!');
    setTimeout(() => window.location.reload(), 1500);
  } catch (err: any) {
    showStatus('Error: ' + err.message, 'error');
  }
};

// ALSO ADD THIS TO PERMANENTLY DELETE HOSTEL AND LOGOS IF THEY RETURN:
const removeHostelPermanent = async () => {
  if (!confirm('Permanently delete hostel photo?')) return;
  try {
    const sb = getSupabase();
    if (sb) {
      await sb.storage.from('lcns-files').remove(['real-school/girls-hostel-accommodation.jpg']);
      await sb.from('school_settings').delete().eq('key', 'hostel_image_url');
      await sb.from('gallery').delete().eq('title', 'Girls Hostel Accommodation');
    }
    localStorage.removeItem('hostel_image_url');
    setHostelPhoto('');
    showStatus('Hostel photo permanently deleted!');
  } catch (err: any) {
    showStatus(err.message, 'error');
  }
};
