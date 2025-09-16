// Users Storage Manager
// Handles saving and loading user data from localStorage and Supabase

class UsersStorage {
    constructor() {
        this.storageKey = 'local_users';
        this.useSupabase = true; // Flag to determine if we should use Supabase
        this.initializeDefaultUsers();
    }

    // Check if Supabase is available
    isSupabaseAvailable() {
        return this.useSupabase && window.supabaseConfig && typeof window.supabaseConfig.getUsers === 'function';
    }

    // Initialize with some default users if none exist (fallback for localStorage)
    initializeDefaultUsers() {
        if (!this.isSupabaseAvailable()) {
            const existingUsers = this.loadUsersFromLocal();
            if (existingUsers.length === 0) {
                const defaultUsers = [
                    {
                        id: 'user_1',
                        name: 'أحمد محمد',
                        email: 'ahmed.mohamed@example.com',
                        role: 'مواطن',
                        joinDate: new Date().toISOString(),
                        reportCount: 0
                    },
                    {
                        id: 'user_2',
                        name: 'فاطمة علي',
                        email: 'fatima.ali@example.com',
                        role: 'مواطن',
                        joinDate: new Date().toISOString(),
                        reportCount: 0
                    },
                    {
                        id: 'user_3',
                        name: 'محمد حسن',
                        email: 'mohamed.hassan@example.com',
                        role: 'مواطن',
                        joinDate: new Date().toISOString(),
                        reportCount: 0
                    }
                ];
                this.saveUsersToLocal(defaultUsers);
            }
        }
    }

    // Load users from Supabase or localStorage
    async loadUsers() {
        if (this.isSupabaseAvailable()) {
            try {
                console.log('Loading users from Supabase...');
                const { users, error } = await window.supabaseConfig.getUsersWithReportCount();
                
                if (error) {
                    console.error('Supabase error, falling back to localStorage:', error);
                    return this.loadUsersFromLocal();
                }
                
                console.log('Users loaded from Supabase:', users.length, 'users');
                return users || [];
            } catch (error) {
                console.error('Error loading from Supabase, falling back to localStorage:', error);
                return this.loadUsersFromLocal();
            }
        } else {
            return this.loadUsersFromLocal();
        }
    }

    // Load users from localStorage (fallback method)
    loadUsersFromLocal() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (!storedData) {
                console.log('No stored users found in localStorage');
                return [];
            }

            const usersData = JSON.parse(storedData);
            console.log('Users loaded from localStorage:', usersData.users.length, 'users');
            
            return usersData.users || [];
        } catch (error) {
            console.error('Error loading users from localStorage:', error);
            return [];
        }
    }

    // Save users to localStorage (fallback method)
    saveUsersToLocal(users) {
        try {
            const usersData = {
                users: users,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem(this.storageKey, JSON.stringify(usersData));
            console.log('Users saved to localStorage:', users.length, 'users');
            return true;
        } catch (error) {
            console.error('Error saving users to localStorage:', error);
            return false;
        }
    }

    // Add a new user (Supabase or localStorage)
    async addUser(user) {
        if (this.isSupabaseAvailable()) {
            try {
                const userData = {
                    name: user.name,
                    email: user.email,
                    role: user.role || 'مواطن',
                    created_at: new Date().toISOString(),
                    reportCount: 0
                };
                
                const { user: savedUser, error } = await window.supabaseConfig.saveUser(userData);
                
                if (error) {
                    console.error('Error saving user to Supabase:', error);
                    return false;
                }
                
                console.log('User saved to Supabase:', savedUser);
                return true;
            } catch (error) {
                console.error('Error adding user to Supabase:', error);
                return false;
            }
        } else {
            const existingUsers = this.loadUsersFromLocal();
            const newUser = {
                id: 'user_' + Date.now(),
                ...user,
                joinDate: new Date().toISOString(),
                reportCount: 0
            };
            existingUsers.push(newUser);
            return this.saveUsersToLocal(existingUsers);
        }
    }

    // Update user data (Supabase or localStorage)
    async updateUser(userId, updatedData) {
        if (this.isSupabaseAvailable()) {
            try {
                const { user, error } = await window.supabaseConfig.updateUser(userId, updatedData);
                
                if (error) {
                    console.error('Error updating user in Supabase:', error);
                    return false;
                }
                
                console.log('User updated in Supabase:', user);
                return true;
            } catch (error) {
                console.error('Error updating user in Supabase:', error);
                return false;
            }
        } else {
            try {
                const users = this.loadUsersFromLocal();
                const userIndex = users.findIndex(u => u.id === userId);
                
                if (userIndex === -1) {
                    console.error('User not found:', userId);
                    return false;
                }
                
                users[userIndex] = { ...users[userIndex], ...updatedData };
                
                const success = this.saveUsersToLocal(users);
                if (success) {
                    console.log('User updated successfully:', userId);
                }
                return success;
            } catch (error) {
                console.error('Error updating user:', error);
                return false;
            }
        }
    }

    // Delete a user (Supabase or localStorage)
    async deleteUser(userId) {
        if (this.isSupabaseAvailable()) {
            try {
                const { error } = await window.supabaseConfig.deleteUser(userId);
                
                if (error) {
                    console.error('Error deleting user from Supabase:', error);
                    return false;
                }
                
                console.log('User deleted from Supabase:', userId);
                return true;
            } catch (error) {
                console.error('Error deleting user from Supabase:', error);
                return false;
            }
        } else {
            try {
                const users = this.loadUsersFromLocal();
                const filteredUsers = users.filter(u => u.id !== userId);
                
                if (filteredUsers.length === users.length) {
                    console.error('User not found for deletion:', userId);
                    return false;
                }
                
                const success = this.saveUsersToLocal(filteredUsers);
                if (success) {
                    console.log('User deleted successfully:', userId);
                }
                return success;
            } catch (error) {
                console.error('Error deleting user:', error);
                return false;
            }
        }
    }

    // Get user by ID (Supabase or localStorage)
    async getUserById(userId) {
        if (this.isSupabaseAvailable()) {
            try {
                const { user, error } = await window.supabaseConfig.getUserById(userId);
                
                if (error) {
                    console.error('Error getting user from Supabase:', error);
                    return null;
                }
                
                return user;
            } catch (error) {
                console.error('Error getting user from Supabase:', error);
                return null;
            }
        } else {
            try {
                const users = this.loadUsersFromLocal();
                return users.find(u => u.id === userId) || null;
            } catch (error) {
                console.error('Error getting user by ID:', error);
                return null;
            }
        }
    }

    // Update user report count (async for Supabase compatibility)
    async updateUserReportCount(userEmail) {
        // This method is now handled automatically by getUsersWithReportCount in Supabase
        if (this.isSupabaseAvailable()) {
            console.log('Report counts are automatically calculated with Supabase');
            return true;
        } else {
            try {
                const users = this.loadUsersFromLocal();
                const reports = window.reportsStorage ? window.reportsStorage.loadReports() : [];
                
                users.forEach(user => {
                    const userReports = reports.filter(r => r.email === user.email);
                    user.reportCount = userReports.length;
                });
                
                return this.saveUsersToLocal(users);
            } catch (error) {
                console.error('Error updating user report counts:', error);
                return false;
            }
        }
    }

    // Get users statistics (async for Supabase compatibility)
    async getUsersStats() {
        try {
            const users = await this.loadUsers();
            const totalReports = users.reduce((sum, user) => sum + (user.reportCount || 0), 0);
            
            return {
                totalUsers: users.length,
                totalReports: totalReports,
                averageReportsPerUser: users.length > 0 ? (totalReports / users.length).toFixed(1) : 0,
                mostActiveUser: users.length > 0 ? users.reduce((prev, current) => 
                    ((prev.reportCount || 0) > (current.reportCount || 0)) ? prev : current) : null
            };
        } catch (error) {
            console.error('Error getting users statistics:', error);
            return null;
        }
    }

    // Clear all users
    clearUsers() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('All users cleared from localStorage');
            return true;
        } catch (error) {
            console.error('Error clearing users:', error);
            return false;
        }
    }
}

// Create global instance
window.usersStorage = new UsersStorage();