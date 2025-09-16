// Reports Storage Manager
// Handles saving and loading reports from localStorage

class ReportsStorage {
    constructor() {
        this.storageKey = 'local_reports';
    }

    // Save reports to localStorage
    saveReports(reports) {
        try {
            const reportsData = {
                reports: reports,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem(this.storageKey, JSON.stringify(reportsData));
            console.log('Reports saved to localStorage:', reports.length, 'reports');
            return true;
        } catch (error) {
            console.error('Error saving reports to localStorage:', error);
            return false;
        }
    }

    // Load reports from localStorage
    loadReports() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (!storedData) {
                console.log('No stored reports found');
                return [];
            }

            const reportsData = JSON.parse(storedData);
            console.log('Reports loaded from localStorage:', reportsData.reports.length, 'reports');
            console.log('Last updated:', reportsData.lastUpdated);
            
            return reportsData.reports || [];
        } catch (error) {
            console.error('Error loading reports from localStorage:', error);
            return [];
        }
    }

    // Add a single report
    addReport(report) {
        const existingReports = this.loadReports();
        existingReports.unshift(report); // Add to beginning of array
        return this.saveReports(existingReports);
    }

    // Update a specific report
    updateReport(reportId, updatedData) {
        try {
            const reports = this.loadReports();
            const reportIndex = reports.findIndex(r => r.id === reportId);
            
            if (reportIndex === -1) {
                console.error('Report not found:', reportId);
                return false;
            }
            
            // Merge existing data with updates
            reports[reportIndex] = { ...reports[reportIndex], ...updatedData };
            
            const success = this.saveReports(reports);
            if (success) {
                console.log('Report updated successfully:', reportId);
            }
            return success;
        } catch (error) {
            console.error('Error updating report:', error);
            return false;
        }
    }

    // Delete a specific report
    deleteReport(reportId) {
        try {
            const reports = this.loadReports();
            const filteredReports = reports.filter(r => r.id !== reportId);
            
            if (filteredReports.length === reports.length) {
                console.error('Report not found for deletion:', reportId);
                return false;
            }
            
            const success = this.saveReports(filteredReports);
            if (success) {
                console.log('Report deleted successfully:', reportId);
            }
            return success;
        } catch (error) {
            console.error('Error deleting report:', error);
            return false;
        }
    }

    // Get a specific report by ID
    getReportById(reportId) {
        try {
            const reports = this.loadReports();
            return reports.find(r => r.id === reportId) || null;
        } catch (error) {
            console.error('Error getting report by ID:', error);
            return null;
        }
    }

    // Get reports by status
    getReportsByStatus(status) {
        try {
            const reports = this.loadReports();
            return reports.filter(r => r.status === status);
        } catch (error) {
            console.error('Error getting reports by status:', error);
            return [];
        }
    }

    // Get reports statistics
    getReportsStats() {
        try {
            const reports = this.loadReports();
            return {
                total: reports.length,
                new: reports.filter(r => r.status === 'new').length,
                inProgress: reports.filter(r => r.status === 'in-progress').length,
                resolved: reports.filter(r => r.status === 'resolved').length,
                resolvedByOfficial: reports.filter(r => r.status === 'resolved_by_official').length,
                withImages: reports.filter(r => r.hasImages).length,
                byPriority: {
                    low: reports.filter(r => r.priority === 'low').length,
                    medium: reports.filter(r => r.priority === 'medium').length,
                    high: reports.filter(r => r.priority === 'high').length,
                    urgent: reports.filter(r => r.priority === 'urgent').length
                }
            };
        } catch (error) {
            console.error('Error getting reports statistics:', error);
            return null;
        }
    }

    // Clear all reports
    clearReports() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('All reports cleared from localStorage');
            return true;
        } catch (error) {
            console.error('Error clearing reports:', error);
            return false;
        }
    }

    // Get reports count
    getReportsCount() {
        const reports = this.loadReports();
        return reports.length;
    }

    // Export reports as JSON file (optional feature)
    exportReports() {
        const reports = this.loadReports();
        const dataStr = JSON.stringify(reports, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `reports_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Create global instance
window.reportsStorage = new ReportsStorage();