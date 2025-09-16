// Supabase configuration
window.supabaseConfig = {
  url: 'https://zccbdsshckadfvoexztn.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjY2Jkc3NoY2thZGZ2b2V4enRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NjAyMDIsImV4cCI6MjA3MzQzNjIwMn0.XErzcX_nvfiLlsa5RaZda6601SZlU6z8jX7J9nM-zoM',
  client: null,
  initSupabase: function() {
    if (!this.client && window.supabase) {
      this.client = window.supabase.createClient(this.url, this.key);
      console.log('Supabase initialized');
    }
    return this.client;
  },
  getReports: async function() {
    try {
      const supabase = this.initSupabase();
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      return { reports: data, error };
    } catch (err) {
      console.error('Error fetching reports:', err);
      return { reports: [], error: err };
    }
  },
  saveReport: async function(reportData) {
    try {
      const supabase = this.initSupabase();
      const { data, error } = await supabase
        .from('reports')
        .insert([reportData])
        .select();
      
      return { report: data?.[0], error };
    } catch (err) {
      console.error('Error saving report:', err);
      return { report: null, error: err };
    }
  },
  
  // User management functions
  getUsers: async function() {
    try {
      const supabase = this.initSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        return { users: [], error };
      }
      
      return { users: data || [], error: null };
    } catch (err) {
      console.error('Error fetching users:', err);
      return { users: [], error: err };
    }
  },
  
  getUserById: async function(userId) {
    try {
      const supabase = this.initSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      return { user: data, error };
    } catch (err) {
      console.error('Error fetching user:', err);
      return { user: null, error: err };
    }
  },
  
  saveUser: async function(userData) {
    try {
      const supabase = this.initSupabase();
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select();
      
      return { user: data?.[0], error };
    } catch (err) {
      console.error('Error saving user:', err);
      return { user: null, error: err };
    }
  },
  
  updateUser: async function(userId, userData) {
    try {
      const supabase = this.initSupabase();
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select();
      
      return { user: data?.[0], error };
    } catch (err) {
      console.error('Error updating user:', err);
      return { user: null, error: err };
    }
  },
  
  deleteUser: async function(userId) {
    try {
      const supabase = this.initSupabase();
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      return { error };
    } catch (err) {
      console.error('Error deleting user:', err);
      return { error: err };
    }
  },
  
  getUsersWithReportCount: async function() {
    try {
      const supabase = this.initSupabase();
      
      // Get users with report count using a join or separate queries
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        return { users: [], error: usersError };
      }
      
      // Get report counts for each user
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('email');
      
      if (reportsError) {
        console.error('Error fetching reports for count:', reportsError);
        return { users: users || [], error: reportsError };
      }
      
      // Calculate report counts
      const usersWithCounts = (users || []).map(user => {
        const reportCount = (reports || []).filter(report => report.email === user.email).length;
        return {
          ...user,
          reportCount: reportCount
        };
      });
      
      return { users: usersWithCounts, error: null };
    } catch (err) {
      console.error('Error fetching users with report count:', err);
      return { users: [], error: err };
    }
  }
};