import { createClient } from '@supabase/supabase-js';
import { UserProfile, UserRole, DEFAULT_USER_AVATAR } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xruorzvokjoszybxqaaj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydW9yenZva2pvc3p5YnhxYWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDMwMTUsImV4cCI6MjEwNTQxOTAxNX0.royGbfFEiNwyNbqfPP-17YFvq2OvYGFciJKYz3ceX-8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper to check connection health
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase ping check:', error.message);
    }
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return false;
  }
}

// Upload file to Supabase support-attachments bucket with fallback
export async function uploadSupportAttachment(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const { error } = await supabase.storage
      .from('support-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.warn('Supabase Storage upload warning:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('support-attachments')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Upload exception:', err);
    return null;
  }
}

// Fetch user profile from Supabase profiles table
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching user profile:', error.message);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user && !profile) return null;

    return {
      id: userId,
      name: profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'مستخدم يَدَوِي',
      email: user?.email || '',
      phone: profile?.phone || user?.user_metadata?.phone || '',
      role: (profile?.role || user?.user_metadata?.role || 'customer') as UserRole,
      avatar: profile?.avatar_url || user?.user_metadata?.avatar_url || DEFAULT_USER_AVATAR,
      governorate: profile?.governorate || user?.user_metadata?.governorate || 'القاهرة',
      provider: (user?.app_metadata?.provider === 'google' ? 'google' : 'email') as 'google' | 'email',
      isVerified: Boolean(user?.email_confirmed_at),
      createdAt: profile?.created_at || user?.created_at || new Date().toISOString()
    };
  } catch (err) {
    console.error('fetchUserProfile error:', err);
    return null;
  }
}

// Sign up with real email & password via Supabase Auth
export async function signUpWithEmail(params: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  governorate?: string;
  role?: UserRole;
  workshopName?: string;
}): Promise<{ user: UserProfile | null; error: string | null; needsEmailConfirmation?: boolean }> {
  try {
    const userRole = params.role || 'customer';
    const { data, error } = await supabase.auth.signUp({
      email: params.email.trim(),
      password: params.password,
      options: {
        data: {
          name: params.name.trim(),
          phone: params.phone?.trim() || '',
          governorate: params.governorate || 'القاهرة',
          role: userRole,
          workshopName: params.workshopName?.trim() || ''
        }
      }
    });

    if (error) {
      let msg = error.message;
      if (msg.includes('User already registered')) {
        msg = 'هذا البريد الإلكتروني مسجل بالفعل، يمكنك تسجيل الدخول به.';
      } else if (msg.includes('Password should be at least')) {
        msg = 'كلمة المرور يجب أن لا تقل عن 6 أحرف.';
      }
      return { user: null, error: msg };
    }

    if (!data.user) {
      return { user: null, error: 'تعذر إنشاء الحساب، يرجى المحاولة لاحقاً.' };
    }

    // Upsert into public.profiles
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: params.name.trim(),
        role: userRole,
        phone: params.phone?.trim() || null,
        governorate: params.governorate || 'القاهرة',
        avatar_url: DEFAULT_USER_AVATAR
      });

      // If registered as artisan, create entry in public.artisans
      if (userRole === 'artisan') {
        await supabase.from('artisans').insert({
          user_id: data.user.id,
          name: params.name.trim(),
          title: 'صانع وفنان يَدَوِي',
          workshop_name: params.workshopName?.trim() || `ورشة ${params.name.trim()}`,
          governorate: params.governorate || 'القاهرة',
          whatsapp: params.phone?.trim() || null,
          avatar: DEFAULT_USER_AVATAR
        });
      }
    } catch (dbErr) {
      console.warn('Profile upsert warning:', dbErr);
    }

    const userProfile: UserProfile = {
      id: data.user.id,
      name: params.name.trim(),
      email: data.user.email || params.email,
      phone: params.phone || '',
      role: userRole,
      avatar: DEFAULT_USER_AVATAR,
      governorate: params.governorate || 'القاهرة',
      workshopName: params.workshopName,
      provider: 'email',
      isVerified: Boolean(data.user.email_confirmed_at),
      createdAt: data.user.created_at
    };

    const needsEmailConfirmation = !data.session;
    return { user: userProfile, error: null, needsEmailConfirmation };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
    return { user: null, error: message };
  }
}

// Sign in with real email & password via Supabase Auth
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      let friendlyMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        friendlyMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      } else if (error.message.includes('Email not confirmed')) {
        friendlyMessage = 'يرجى تأكيد بريدك الإلكتروني عبر الرسالة المرسلة إليك أولاً.';
      }
      return { user: null, error: friendlyMessage };
    }

    if (!data.user) {
      return { user: null, error: 'تعذر تسجيل الدخول.' };
    }

    const profile = await fetchUserProfile(data.user.id);
    return { user: profile, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول';
    return { user: null, error: message };
  }
}

// Sign in with Google via Supabase OAuth
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    return { error: error ? error.message : null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل الاتصال بـ Google';
    return { error: message };
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Sign out warning:', err);
  }
}
