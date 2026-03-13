import { supabase } from '@/integrations/supabase/client';

// Users API
export const usersApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  update: async (id: string, updates: Record<string, unknown>) => {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
};

// Products API
export const productsApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  create: async (product: Record<string, unknown>) => {
    const { data, error } = await supabase.from('products').insert(product).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id: string, updates: Record<string, unknown>) => {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },
};

// Orders API
export const ordersApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('orders').select('*, products(title, price, images)').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  updateStatus: async (id: string, status: string) => {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    return data;
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return data;
  },
  markRead: async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  },
};

// Dashboard stats
export const dashboardApi = {
  getStats: async () => {
    const [users, products, orders, categories] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
    ]);
    return {
      totalUsers: users.count ?? 0,
      totalProducts: products.count ?? 0,
      totalOrders: orders.count ?? 0,
      totalCategories: categories.count ?? 0,
    };
  },
  getRecentOrders: async () => {
    const { data, error } = await supabase.from('orders').select('*, products(title, price)').order('created_at', { ascending: false }).limit(5);
    if (error) throw error;
    return data;
  },
};
