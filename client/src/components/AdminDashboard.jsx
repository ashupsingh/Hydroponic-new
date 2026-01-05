import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaLeaf, FaChartPie, FaUsers, FaCogs, FaFileAlt, FaTicketAlt } from 'react-icons/fa';
import UserList from './Dashboard/UserList';
import DeviceList from './Dashboard/DeviceList';
import TopBar from './Dashboard/TopBar';
import Overview from './Dashboard/Overview';
import IssueList from './Dashboard/IssueList';
import { API_URL } from '../config';
import './Dashboard/Dashboard.css';

const AdminDashboard = () => {
    const [activeView, setActiveView] = useState('overview');
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Admin';

    const [openIssuesCount, setOpenIssuesCount] = useState(0);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Fetch open issues count
    const fetchOpenIssues = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/issues`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            const open = data.filter(i => i.status === 'Open' || i.status === 'In Progress').length;
            setOpenIssuesCount(open);
        } catch (err) {
            console.error('Failed to fetch issues count', err);
        }
    };

    // Poll for new issues every 30 seconds
    React.useEffect(() => {
        fetchOpenIssues();
        const interval = setInterval(fetchOpenIssues, 30000);
        return () => clearInterval(interval);
    }, []);

    const renderContent = () => {
        if (selectedUser) {
            return <DeviceList user={selectedUser} onBack={() => setSelectedUser(null)} />;
        }

        switch (activeView) {
            case 'overview':
                return <Overview />;
            case 'users':
                return <UserList onSelectUser={setSelectedUser} />;
            case 'issues':
                return <IssueList />;
            default:
                return <div className="placeholder-content">Module under construction</div>;
        }
    };

    const getTitle = () => {
        if (selectedUser) return `Viewing ${selectedUser.name}`;
        if (activeView === 'overview') return 'Dashboard Overview';
        if (activeView === 'users') return 'User Management';
        if (activeView === 'issues') return 'Issue Management';
        return 'System';
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-sidebar">
                <div className="sidebar-brand">
                    <FaLeaf className="brand-icon" />
                    <span>Greeva<span className="text-highlight">Admin</span></span>
                </div>

                <div className="sidebar-menu">
                    <div
                        className={`menu-item ${activeView === 'overview' ? 'active' : ''}`}
                        onClick={() => { setActiveView('overview'); setSelectedUser(null); }}
                    >
                        <FaChartPie /> Dashboard
                    </div>
                    <div
                        className={`menu-item ${activeView === 'users' ? 'active' : ''}`}
                        onClick={() => { setActiveView('users'); setSelectedUser(null); }}
                    >
                        <FaUsers /> Users & Devices
                    </div>
                    <div
                        className={`menu-item ${activeView === 'issues' ? 'active' : ''}`}
                        onClick={() => { setActiveView('issues'); setSelectedUser(null); }}
                    >
                        <FaTicketAlt /> Issues
                    </div>
                    <div className="menu-header">APPS</div>
                    <div className="menu-item"><FaFileAlt /> Invoices</div>
                    <div className="menu-item"><FaCogs /> Settings</div>
                </div>

                <div className="sidebar-footer">
                    <div className="admin-profile">
                        <div className="avatar">A</div>
                        <div className="info">
                            <span className="name">{userName}</span>
                            <span className="role">Premium</span>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>
                        <FaSignOutAlt />
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                <TopBar
                    title={getTitle()}
                    notificationCount={openIssuesCount}
                    onNotificationClick={() => { setActiveView('issues'); setSelectedUser(null); }}
                />
                <div className="content-body">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
