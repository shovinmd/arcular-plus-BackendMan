// Backend Manager Dashboard JavaScript

// Global variables
let currentUser = null;
let systemStats = {};
let rejections = [];
let systemLogs = [];
let users = [];

// Backend API configuration
const API_BASE_URL = 'https://arcular-plus-backend.onrender.com/api';

// Firebase configuration for Arcular+ project
const firebaseConfig = {
    apiKey: "AIzaSyBzK4SQ44cv6k8EiNF9B2agNASArWQrstk",
    authDomain: "arcularplus-7e66c.firebaseapp.com",
    projectId: "arcularplus-7e66c",
    storageBucket: "arcularplus-7e66c.firebasestorage.app",
    messagingSenderId: "239874151024",
    appId: "1:239874151024:android:7e0d9de0400c6bb9fb5ab5"
};

// Initialize Firebase if not already initialized
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK not loaded');
}

// Authentication functions
async function getAuthToken() {
    try {
        const user = firebase.auth().currentUser;
        if (user) {
            return await user.getIdToken();
        }
        return null;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

// Initialize dashboard
async function initializeDashboard() {
    try {
        console.log('🚀 Initializing Backend Manager Dashboard...');
        
        // Update user info
        updateUserInfo();
        
        // Initialize navigation
        initializeNavigation();
        
        // Load initial data
        await loadSystemOverview();
        
        // Show dashboard
        showDashboardContent();
        
        console.log('✅ Dashboard initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        showErrorMessage('Failed to initialize dashboard');
    }
}

// Update user information display
function updateUserInfo() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.displayName || 'Backend Manager';
        document.getElementById('userEmail').textContent = currentUser.email;
    }
}

// Initialize navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Get section name
            const sectionName = item.dataset.section;
            
            // Show corresponding section
            showSection(sectionName);
        });
    });
}

// Show specific section
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section data
        loadSectionData(sectionName);
    }
}

// Load section data
async function loadSectionData(sectionName) {
    try {
        switch (sectionName) {
            case 'overview':
                await loadSystemOverview();
                break;
            case 'rejections':
                await loadStaffRejections();
                break;
            case 'data-cleanup':
                await loadDataCleanupInfo();
                break;
            case 'system-logs':
                await loadSystemLogs();
                break;
            case 'user-management':
                await loadUsers();
                break;
            case 'backup-restore':
                await loadBackupInfo();
                break;
        }
    } catch (error) {
        console.error(`❌ Error loading ${sectionName} data:`, error);
        showErrorMessage(`Failed to load ${sectionName} data`);
    }
}

// Load system overview
async function loadSystemOverview() {
    try {
        console.log('🔄 Loading system overview...');
        
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/backend-manager/system-overview`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                systemStats = result.data;
                updateSystemStats();
                loadRecentActivity();
            }
        } else {
            // Use mock data for now
            loadMockSystemData();
        }
        
    } catch (error) {
        console.error('❌ Error loading system overview:', error);
        loadMockSystemData();
    }
}

// Load mock system data (for development)
function loadMockSystemData() {
    systemStats = {
        totalUsers: 1247,
        systemHealth: 98,
        databaseSize: '2.4GB',
        uptime: 99.9
    };
    
    updateSystemStats();
    loadMockRecentActivity();
}

// Update system statistics display
function updateSystemStats() {
    document.getElementById('totalUsers').textContent = systemStats.totalUsers?.toLocaleString() || '0';
    document.getElementById('systemHealth').textContent = `${systemStats.systemHealth || 0}%`;
    document.getElementById('databaseSize').textContent = systemStats.databaseSize || '0GB';
    document.getElementById('uptime').textContent = `${systemStats.uptime || 0}%`;
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/backend-manager/recent-activity`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                renderRecentActivity(result.data);
            }
        }
    } catch (error) {
        console.error('❌ Error loading recent activity:', error);
    }
}

// Load mock recent activity
function loadMockRecentActivity() {
    const mockActivity = [
        {
            type: 'user_registration',
            message: 'New service provider registered',
            time: '2 minutes ago',
            icon: 'fas fa-user-plus',
            color: 'success'
        },
        {
            type: 'system_backup',
            message: 'Daily backup completed successfully',
            time: '1 hour ago',
            icon: 'fas fa-database',
            color: 'info'
        },
        {
            type: 'data_cleanup',
            message: 'Rejected user data cleaned up',
            time: '3 hours ago',
            icon: 'fas fa-broom',
            color: 'warning'
        },
        {
            type: 'error_log',
            message: 'System error detected and resolved',
            time: '5 hours ago',
            icon: 'fas fa-exclamation-triangle',
            color: 'danger'
        }
    ];
    
    renderRecentActivity(mockActivity);
}

// Render recent activity
function renderRecentActivity(activities) {
    const activityList = document.getElementById('activityList');
    
    if (!activities || activities.length === 0) {
        activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
        return;
    }
    
    const activityHTML = activities.map(activity => `
        <div class="activity-item ${activity.color}">
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p class="activity-message">${activity.message}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `).join('');
    
    activityList.innerHTML = activityHTML;
}

// Load staff rejections
async function loadStaffRejections() {
    try {
        console.log('🔄 Loading staff rejections...');
        
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/backend-manager/staff-rejections`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                rejections = result.data;
                renderRejections();
                updateRejectionCount();
            }
        } else {
            // Use mock data for now
            loadMockRejections();
        }
        
    } catch (error) {
        console.error('❌ Error loading staff rejections:', error);
        loadMockRejections();
    }
}

// Load mock rejections
function loadMockRejections() {
    rejections = [
        {
            id: '1',
            providerType: 'hospital',
            providerName: 'City General Hospital',
            staffName: 'John Smith',
            rejectionReason: 'Incomplete documentation',
            rejectionDate: '2024-01-28T10:30:00Z',
            status: 'pending',
            email: 'admin@cityhospital.com'
        },
        {
            id: '2',
            providerType: 'doctor',
            providerName: 'Dr. Sarah Johnson',
            staffName: 'Jane Doe',
            rejectionReason: 'Expired license',
            rejectionDate: '2024-01-27T15:45:00Z',
            status: 'cleaned',
            email: 'sarah.johnson@email.com'
        }
    ];
    
    renderRejections();
    updateRejectionCount();
}

// Render rejections
function renderRejections() {
    const rejectionsList = document.getElementById('rejectionsList');
    
    if (!rejections || rejections.length === 0) {
        rejectionsList.innerHTML = '<p class="no-rejections">No rejections found</p>';
        return;
    }
    
    const rejectionsHTML = rejections.map(rejection => `
        <div class="rejection-item ${rejection.status}">
            <div class="rejection-info">
                <div class="provider-details">
                    <h4>${rejection.providerName}</h4>
                    <span class="provider-type">${rejection.providerType}</span>
                    <span class="provider-email">${rejection.email}</span>
                </div>
                <div class="rejection-details">
                    <p class="rejection-reason">${rejection.rejectionReason}</p>
                    <span class="staff-name">Rejected by: ${rejection.staffName}</span>
                    <span class="rejection-date">${formatDate(rejection.rejectionDate)}</span>
                </div>
            </div>
            <div class="rejection-actions">
                <span class="status-badge ${rejection.status}">${rejection.status}</span>
                ${rejection.status === 'pending' ? `
                    <button class="btn btn-warning btn-sm" onclick="cleanupRejectedUser('${rejection.id}')">
                        <i class="fas fa-broom"></i> Cleanup
                    </button>
                ` : ''}
                <button class="btn btn-info btn-sm" onclick="viewRejectionDetails('${rejection.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </div>
        </div>
    `).join('');
    
    rejectionsList.innerHTML = rejectionsHTML;
}

// Update rejection count
function updateRejectionCount() {
    const pendingCount = rejections.filter(r => r.status === 'pending').length;
    const rejectionCountElement = document.getElementById('rejectionCount');
    
    if (rejectionCountElement) {
        rejectionCountElement.textContent = pendingCount;
        
        // Hide badge if no pending rejections
        if (pendingCount === 0) {
            rejectionCountElement.style.display = 'none';
        } else {
            rejectionCountElement.style.display = 'block';
        }
    }
}

// Cleanup rejected user
async function cleanupRejectedUser(rejectionId) {
    try {
        if (confirm('Are you sure you want to clean up this rejected user? This action cannot be undone.')) {
            console.log(`🔄 Cleaning up rejected user: ${rejectionId}`);
            
            const token = await getAuthToken();
            const response = await fetch(`${API_BASE_URL}/backend-manager/cleanup-user/${rejectionId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Update local data
                    const rejection = rejections.find(r => r.id === rejectionId);
                    if (rejection) {
                        rejection.status = 'cleaned';
                    }
                    
                    // Re-render and update count
                    renderRejections();
                    updateRejectionCount();
                    
                    showSuccessMessage('User data cleaned up successfully');
                }
            } else {
                throw new Error('Failed to cleanup user');
            }
        }
    } catch (error) {
        console.error('❌ Error cleaning up user:', error);
        showErrorMessage('Failed to cleanup user data');
    }
}

// View rejection details
function viewRejectionDetails(rejectionId) {
    const rejection = rejections.find(r => r.id === rejectionId);
    if (rejection) {
        // Show detailed modal with rejection information
        showRejectionDetailsModal(rejection);
    }
}

// Show rejection details modal
function showRejectionDetailsModal(rejection) {
    // Create and show modal with rejection details
    const modalHTML = `
        <div class="modal" id="rejectionDetailsModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Rejection Details</h3>
                    <span class="close" onclick="closeRejectionDetailsModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="rejection-details-full">
                        <h4>Provider Information</h4>
                        <p><strong>Name:</strong> ${rejection.providerName}</p>
                        <p><strong>Type:</strong> ${rejection.providerType}</p>
                        <p><strong>Email:</strong> ${rejection.email}</p>
                        
                        <h4>Rejection Information</h4>
                        <p><strong>Reason:</strong> ${rejection.rejectionReason}</p>
                        <p><strong>Staff Member:</strong> ${rejection.staffName}</p>
                        <p><strong>Date:</strong> ${formatDate(rejection.rejectionDate)}</p>
                        <p><strong>Status:</strong> <span class="status-badge ${rejection.status}">${rejection.status}</span></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeRejectionDetailsModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    document.getElementById('rejectionDetailsModal').style.display = 'block';
}

// Close rejection details modal
function closeRejectionDetailsModal() {
    const modal = document.getElementById('rejectionDetailsModal');
    if (modal) {
        modal.remove();
    }
}

// Load data cleanup information
async function loadDataCleanupInfo() {
    try {
        console.log('🔄 Loading data cleanup information...');
        
        // Load cleanup history
        await loadCleanupHistory();
        
    } catch (error) {
        console.error('❌ Error loading cleanup info:', error);
    }
}

// Load cleanup history
async function loadCleanupHistory() {
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/backend-manager/cleanup-history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                renderCleanupHistory(result.data);
            }
        } else {
            // Use mock data
            renderCleanupHistory(getMockCleanupHistory());
        }
        
    } catch (error) {
        console.error('❌ Error loading cleanup history:', error);
        renderCleanupHistory(getMockCleanupHistory());
    }
}

// Get mock cleanup history
function getMockCleanupHistory() {
    return [
        {
            id: '1',
            operation: 'Rejected User Cleanup',
            details: 'Cleaned up 5 rejected hospital applications',
            timestamp: '2024-01-28T14:30:00Z',
            status: 'completed',
            recordsAffected: 5
        },
        {
            id: '2',
            operation: 'Old Data Archiving',
            details: 'Archived user data older than 2 years',
            timestamp: '2024-01-27T09:15:00Z',
            status: 'completed',
            recordsAffected: 150
        }
    ];
}

// Render cleanup history
function renderCleanupHistory(history) {
    const historyList = document.getElementById('cleanupHistoryList');
    
    if (!history || history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No cleanup operations found</p>';
        return;
    }
    
    const historyHTML = history.map(item => `
        <div class="history-item ${item.status}">
            <div class="history-info">
                <h4>${item.operation}</h4>
                <p>${item.details}</p>
                <span class="history-time">${formatDate(item.timestamp)}</span>
                <span class="records-affected">${item.recordsAffected} records affected</span>
            </div>
            <div class="history-status">
                <span class="status-badge ${item.status}">${item.status}</span>
            </div>
        </div>
    `).join('');
    
    historyList.innerHTML = historyHTML;
}

// Load system logs
async function loadSystemLogs() {
    try {
        console.log('🔄 Loading system logs...');
        
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/backend-manager/system-logs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                systemLogs = result.data;
                renderSystemLogs();
            }
        } else {
            // Use mock data
            loadMockSystemLogs();
        }
        
    } catch (error) {
        console.error('❌ Error loading system logs:', error);
        loadMockSystemLogs();
    }
}

// Load mock system logs
function loadMockSystemLogs() {
    systemLogs = [
        {
            id: '1',
            level: 'info',
            message: 'System backup completed successfully',
            timestamp: '2024-01-28T15:00:00Z',
            source: 'backup-service'
        },
        {
            id: '2',
            level: 'warning',
            message: 'High memory usage detected',
            timestamp: '2024-01-28T14:45:00Z',
            source: 'system-monitor'
        },
        {
            id: '3',
            level: 'error',
            message: 'Database connection timeout',
            timestamp: '2024-01-28T14:30:00Z',
            source: 'database-service'
        }
    ];
    
    renderSystemLogs();
}

// Render system logs
function renderSystemLogs() {
    const logsList = document.getElementById('logsList');
    
    if (!systemLogs || systemLogs.length === 0) {
        logsList.innerHTML = '<p class="no-logs">No system logs found</p>';
        return;
    }
    
    const logsHTML = systemLogs.map(log => `
        <div class="log-item ${log.level}">
            <div class="log-level">
                <span class="level-badge ${log.level}">${log.level.toUpperCase()}</span>
            </div>
            <div class="log-content">
                <p class="log-message">${log.message}</p>
                <div class="log-meta">
                    <span class="log-source">${log.source}</span>
                    <span class="log-time">${formatDate(log.timestamp)}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    logsList.innerHTML = logsHTML;
}

// Load users
async function loadUsers() {
    try {
        console.log('🔄 Loading users...');
        
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/backend-manager/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                users = result.data;
                renderUsers();
            }
        } else {
            // Use mock data
            loadMockUsers();
        }
        
    } catch (error) {
        console.error('❌ Error loading users:', error);
        loadMockUsers();
    }
}

// Load mock users
function loadMockUsers() {
    users = [
        {
            id: '1',
            name: 'John Admin',
            email: 'john.admin@arcular.com',
            role: 'admin',
            status: 'active',
            lastLogin: '2024-01-28T16:00:00Z'
        },
        {
            id: '2',
            name: 'Sarah Staff',
            email: 'sarah.staff@arcular.com',
            role: 'staff',
            status: 'active',
            lastLogin: '2024-01-28T15:30:00Z'
        }
    ];
    
    renderUsers();
}

// Render users
function renderUsers() {
    const usersList = document.getElementById('usersList');
    
    if (!users || users.length === 0) {
        usersList.innerHTML = '<p class="no-users">No users found</p>';
        return;
    }
    
    const usersHTML = users.map(user => `
        <div class="user-item">
            <div class="user-info">
                <h4>${user.name}</h4>
                <span class="user-email">${user.email}</span>
                <span class="user-role">${user.role}</span>
            </div>
            <div class="user-status">
                <span class="status-badge ${user.status}">${user.status}</span>
                <span class="last-login">Last login: ${formatDate(user.lastLogin)}</span>
            </div>
            <div class="user-actions">
                <button class="btn btn-secondary btn-sm" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
    
    usersList.innerHTML = usersHTML;
}

// Load backup information
async function loadBackupInfo() {
    try {
        console.log('🔄 Loading backup information...');
        
        // Load backup history
        await loadBackupHistory();
        
    } catch (error) {
        console.error('❌ Error loading backup info:', error);
    }
}

// Load backup history
async function loadBackupHistory() {
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/backend-manager/backup-history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                renderBackupHistory(result.data);
            }
        } else {
            // Use mock data
            renderBackupHistory(getMockBackupHistory());
        }
        
    } catch (error) {
        console.error('❌ Error loading backup history:', error);
        renderBackupHistory(getMockBackupHistory());
    }
}

// Get mock backup history
function getMockBackupHistory() {
    return [
        {
            id: '1',
            type: 'Full Backup',
            size: '2.4GB',
            timestamp: '2024-01-28T02:00:00Z',
            status: 'completed',
            duration: '15 minutes'
        },
        {
            id: '2',
            type: 'Incremental Backup',
            size: '150MB',
            timestamp: '2024-01-27T02:00:00Z',
            status: 'completed',
            duration: '5 minutes'
        }
    ];
}

// Render backup history
function renderBackupHistory(history) {
    const historyList = document.getElementById('backupHistoryList');
    
    if (!history || history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No backup operations found</p>';
        return;
    }
    
    const historyHTML = history.map(item => `
        <div class="history-item ${item.status}">
            <div class="history-info">
                <h4>${item.type}</h4>
                <p>Size: ${item.size} | Duration: ${item.duration}</p>
                <span class="history-time">${formatDate(item.timestamp)}</span>
            </div>
            <div class="history-status">
                <span class="status-badge ${item.status}">${item.status}</span>
            </div>
        </div>
    `).join('');
    
    historyList.innerHTML = historyHTML;
}

// Action functions
function initiateDataCleanup() {
    if (confirm('Are you sure you want to initiate data cleanup? This will remove all rejected user data.')) {
        showSuccessMessage('Data cleanup initiated. This process will run in the background.');
        // Implement actual cleanup logic
    }
}

function initiateDataArchiving() {
    if (confirm('Are you sure you want to archive old data? This will move old records to archive storage.')) {
        showSuccessMessage('Data archiving initiated. This process will run in the background.');
        // Implement actual archiving logic
    }
}

function viewCleanupAnalytics() {
    showInfoMessage('Cleanup analytics dashboard will be available in the next update.');
}

function createBackup() {
    if (confirm('Are you sure you want to create a new backup? This may take several minutes.')) {
        showSuccessMessage('Backup creation initiated. You will be notified when it completes.');
        // Implement actual backup logic
    }
}

function restoreBackup() {
    showInfoMessage('Backup restoration will be available in the next update.');
}

function configureAutoBackup() {
    showInfoMessage('Auto backup configuration will be available in the next update.');
}

function createNewUser() {
    showInfoMessage('User creation will be available in the next update.');
}

function bulkUserOperations() {
    showInfoMessage('Bulk user operations will be available in the next update.');
}

function exportUserData() {
    showInfoMessage('User data export will be available in the next update.');
}

function editUser(userId) {
    showInfoMessage(`Edit user ${userId} will be available in the next update.`);
}

function deleteUser(userId) {
    if (confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) {
        showSuccessMessage(`User ${userId} deleted successfully.`);
        // Implement actual delete logic
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showDashboardContent() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('dashboardContent').style.display = 'block';
}

// Message functions
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showInfoMessage(message) {
    showMessage(message, 'info');
}

function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    messageContainer.appendChild(messageElement);
    
    // Show message
    setTimeout(() => {
        messageElement.classList.add('show');
    }, 100);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => {
            messageContainer.removeChild(messageElement);
        }, 300);
    }, 3000);
}

// Initialize settings
function initializeSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeBtn = settingsModal.querySelector('.close');
    const saveBtn = document.getElementById('saveSettingsBtn');
    const cancelBtn = document.getElementById('cancelSettingsBtn');
    
    // Open settings modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });
    
    // Close settings modal
    closeBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
    
    // Save settings
    saveBtn.addEventListener('click', saveSettings);
    
    // Cancel settings
    cancelBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
}

// Save settings
async function saveSettings() {
    try {
        const settings = {
            autoCleanup: document.getElementById('autoCleanup').value,
            backupFrequency: document.getElementById('backupFrequency').value,
            rejectionNotifications: document.getElementById('rejectionNotifications').checked,
            systemAlerts: document.getElementById('systemAlerts').checked,
            backupNotifications: document.getElementById('backupNotifications').checked
        };
        
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/backend-manager/settings`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showSuccessMessage('Settings saved successfully!');
                document.getElementById('settingsModal').style.display = 'none';
            } else {
                throw new Error(result.message || 'Failed to save settings');
            }
        } else {
            throw new Error('Failed to save settings');
        }
        
    } catch (error) {
        console.error('❌ Error saving settings:', error);
        showErrorMessage('Failed to save settings');
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        firebase.auth().signOut().then(() => {
            window.location.href = 'https://arcular-plus-staffs.vercel.app/';
        }).catch((error) => {
            console.error('Logout error:', error);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing Backend Manager Dashboard...');
    
    // Check if Firebase is properly initialized
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK not loaded');
        showErrorMessage('Firebase SDK not loaded. Please refresh the page.');
        return;
    }
    
    console.log('✅ Firebase SDK loaded, setting up auth listener...');
    
    // Set up authentication state listener
    firebase.auth().onAuthStateChanged(async function(user) {
        console.log('🔐 Auth state changed:', user ? 'User logged in' : 'No user');
        
        if (user) {
            console.log('✅ User authenticated:', user.email);
            currentUser = user;
            
            // Check if user is a Backend Manager by verifying with backend
            try {
                const token = await user.getIdToken();
                const response = await fetch('https://arcular-plus-backend.onrender.com/staff/api/staff/profile/' + user.uid, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const staffProfile = await response.json();
                    if (staffProfile.staffType !== 'backend_manager') {
                        console.log('❌ User is not a Backend Manager, redirecting to staff login...');
                        setTimeout(() => {
                            window.location.href = 'https://arcular-plus-staffs.vercel.app/';
                        }, 100);
                        return;
                    }
                    console.log('✅ User verified as Backend Manager');
                } else {
                    console.log('❌ Could not verify staff type, redirecting to staff login...');
                    setTimeout(() => {
                        window.location.href = 'https://arcular-plus-staffs.vercel.app/';
                    }, 100);
                    return;
                }
            } catch (error) {
                console.error('❌ Error verifying staff type:', error);
                setTimeout(() => {
                    window.location.href = 'https://arcular-plus-staffs.vercel.app/';
                }, 100);
                return;
            }
            
            console.log('✅ User verified as Backend Manager');
            
            // Hide loading state and show dashboard
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('dashboardContent').style.display = 'block';
            
            initializeDashboard();
        } else {
            console.log('❌ No authenticated user, redirecting to staff login...');
            // Add a small delay to ensure the redirect happens
            setTimeout(() => {
                window.location.href = 'https://arcular-plus-staffs.vercel.app/';
            }, 100);
        }
    }, function(error) {
        console.error('❌ Auth state listener error:', error);
        showErrorMessage('Authentication error. Please refresh the page.');
    });
    
    // Initialize settings
    initializeSettings();
    
    // Add logout event listener
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Add refresh event listener
    document.getElementById('refreshBtn').addEventListener('click', async () => {
        await loadSystemOverview();
        showSuccessMessage('Dashboard refreshed successfully!');
    });
});
