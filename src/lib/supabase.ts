
// FIX FOR BUILD - allows import { supabase }
export const supabase: any = new Proxy({} as any, {
  get(_: any, prop: string) {
    const client = getSupabase();
    if (!client) {
      return (..._args: any[]) => ({ data: null, error: null });
    }
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});
