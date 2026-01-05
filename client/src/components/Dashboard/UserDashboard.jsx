import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaLeaf, FaChartLine, FaFlask, FaEdit, FaSignOutAlt, FaSun,
    FaBolt, FaThermometerHalf, FaTint, FaArrowUp, FaArrowDown, FaWifi, FaEllipsisV, FaBell
} from 'react-icons/fa';
import { API_URL } from '../../config';
import './UserDashboard.css';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area
} from 'recharts';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingDevice, setEditingDevice] = useState(null);
    const [newName, setNewName] = useState('');
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedDeviceHistory, setSelectedDeviceHistory] = useState([]);
    const [selectedDeviceName, setSelectedDeviceName] = useState('');
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [issueDescription, setIssueDescription] = useState('');
    const [selectedIssueDevice, setSelectedIssueDevice] = useState('');
    const [issueSubmitting, setIssueSubmitting] = useState(false);
    const [issues, setIssues] = useState([]);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchDevices();
        fetchIssues();

        const interval = setInterval(() => {
            fetchDevices();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const fetchDevices = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await fetch(`${API_URL}/api/user/devices`, {
                headers: { 'x-auth-token': token }
            });

            if (res.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            const data = await res.json();
            setDevices(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchIssues = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/user/issues`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setIssues(data);
            const responded = data.filter(i => i.adminResponse || i.status === 'Resolved').length;
            setUnreadCount(responded);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    const handleRename = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/user/device/${id}/rename`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ customName: newName })
            });

            if (res.ok) {
                setEditingDevice(null);
                fetchDevices();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleIssueSubmit = async (e) => {
        e.preventDefault();
        if (!selectedIssueDevice) {
            alert('Please select a device.');
            return;
        }
        setIssueSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/user/issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    description: issueDescription,
                    deviceId: selectedIssueDevice
                })
            });

            if (res.ok) {
                alert('Issue reported successfully!');
                setIssueDescription('');
                setIssueDescription('');
                setShowIssueModal(false);
                fetchIssues();
            } else {
                alert('Failed to report issue. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('Server error.');
        } finally {
            setIssueSubmitting(false);
        }
    };

    const moveDevice = async (index, direction) => {
        const newDevices = [...devices];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newDevices.length) return;

        [newDevices[index], newDevices[targetIndex]] = [newDevices[targetIndex], newDevices[index]];
        setDevices(newDevices);

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/user/device-order`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ deviceOrder: newDevices.map(d => d._id) })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const moveSensor = async (deviceId, index, direction) => {
        const device = devices.find(d => d._id === deviceId);
        if (!device) return;

        const defaultOrder = ['temperature', 'humidity', 'ph', 'ec', 'waterLevel', 'lightIntensity'];
        let currentOrder = device.sensorOrder && device.sensorOrder.length > 0 ? [...device.sensorOrder] : [...defaultOrder];

        const targetIndex = direction === 'left' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

        [currentOrder[index], currentOrder[targetIndex]] = [currentOrder[targetIndex], currentOrder[index]];

        // Optimistic UI Update
        const updatedDevices = devices.map(d =>
            d._id === deviceId ? { ...d, sensorOrder: currentOrder } : d
        );
        setDevices(updatedDevices);

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/user/device/${deviceId}/sensor-order`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ sensorOrder: currentOrder })
            });
        } catch (err) {
            console.error('Failed to save sensor order:', err);
            fetchDevices(); // Revert on error
        }
    };

    const fetchDeviceHistory = async (deviceId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/user/device/${deviceId}/history?hours=24`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setSelectedDeviceHistory(data);
            const device = devices.find(d => d._id === deviceId);
            setSelectedDeviceName(device ? (device.customName || device.deviceName) : 'Device');
            setShowHistoryModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    const getSensorIcon = (key) => {
        switch (key) {
            case 'temperature': return <FaThermometerHalf />;
            case 'humidity': return <FaTint />;
            case 'ph': return <FaFlask />;
            case 'ec': return <FaBolt />;
            case 'waterLevel': return <FaTint />; // Using Tint for water level as placeholder, ideally custom wave icon
            case 'lightIntensity': return <FaSun />;
            default: return <FaLeaf />;
        }
    };

    if (loading) return <div className="loading-screen">Loading System...</div>;

    return (
        <div className="dashboard-container">
            {/* Sidebar (Adapting reference sidebar) */}
            <aside className="sidebar">
                <div>
                    <div className="sidebar-header">
                        <FaLeaf />
                        <h2>Eco<span>Dash</span></h2>
                    </div>
                    <nav className="sidebar-nav">
                        <a href="#" className="nav-item active">
                            <div className="icon"><FaChartLine /></div> Overview
                        </a>
                        <a href="#" className="nav-item">
                            <div className="icon"><FaFlask /></div> Devices
                        </a>
                        <a href="#" className="nav-item">
                            <div className="icon"><FaEdit /></div> Settings
                        </a>
                    </nav>
                </div>
                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">
                            {localStorage.getItem('userName')?.substring(0, 2).toUpperCase() || 'AD'}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{localStorage.getItem('userName') || 'Admin User'}</span>
                            <span className="user-role">View Profile</span>
                        </div>
                    </div>
                    <button className="btn-logout-sidebar" onClick={handleLogout}><FaSignOutAlt /></button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="top-bar">
                    <h1 className="page-title">Dashboard Overview</h1>
                    <div className="top-actions">
                        <div
                            className="notification-bell"
                            onClick={() => setShowNotificationsModal(true)}
                            style={{ position: 'relative', cursor: 'pointer', marginRight: '1rem', display: 'flex', alignItems: 'center' }}
                        >
                            <FaBell style={{ color: unreadCount > 0 ? '#f59e0b' : '#94a3b8', fontSize: '1.2rem' }} />
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    background: '#ef4444',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid #0f172a'
                                }}>{unreadCount}</span>
                            )}
                        </div>
                        <FaSun className="text-brand-blue" style={{ color: '#3b82f6', marginRight: '8px' }} />
                        <span className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </header>

                <div className="content-scrollable">

                    {/* Top Stats Row */}
                    <div className="overview-section">
                        {/* Card 1 */}
                        <div className="summary-widget total">
                            <div className="widget-info">
                                <p>Total Devices</p>
                                <p className="value">{devices.length}</p>
                            </div>
                            <div className="widget-icon">
                                <FaFlask />
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="summary-widget status">
                            <div className="widget-info">
                                <p>System Status</p>
                                <p className="value optimal">Optimal</p>
                            </div>
                            <div className="widget-icon">
                                <FaThermometerHalf />
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="summary-widget alerts">
                            <div className="widget-info">
                                <p>Active Alerts</p>
                                <p className="value">0</p>
                            </div>
                            <div className="widget-icon">
                                <FaBolt />
                            </div>
                        </div>
                    </div>

                    {/* My Devices Section */}
                    <div className="devices-section">
                        <div className="devices-section-header">
                            <h2 className="section-title">
                                <FaTint style={{ color: '#3b82f6' }} /> My Devices
                            </h2>
                            <button className="btn-raise-issue" onClick={() => setShowIssueModal(true)}>
                                <FaEdit /> Raise Issue
                            </button>
                        </div>

                        <div className="devices-grid">
                            {devices.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No devices found.</div>
                            ) : devices.map((device, index) => (
                                <div key={device._id} className="device-widget">
                                    {/* Device Header */}
                                    <div className="widget-header">
                                        <div className="header-left">
                                            <div className="device-icon-wrapper">
                                                <div className="status-ping">
                                                    <span className="ping-animation"></span>
                                                    <span className="ping-dot"></span>
                                                </div>
                                                <div className="device-icon-box">
                                                    <FaWifi />
                                                </div>
                                            </div>
                                            <div className="device-identity">
                                                {editingDevice === device._id ? (
                                                    <input
                                                        className="edit-input"
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        autoFocus
                                                        onBlur={() => handleRename(device._id)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleRename(device._id)}
                                                    />
                                                ) : (
                                                    <h3 onClick={() => {
                                                        setEditingDevice(device._id);
                                                        setNewName(device.customName || device.deviceName);
                                                    }}>
                                                        {device.customName || device.deviceName}
                                                    </h3>
                                                )}
                                                <div className="device-meta">
                                                    <span className="device-id-badge">ID: {device.serialNumber}</span>
                                                    <span className="device-uptime"><FaArrowUp style={{ fontSize: '0.6rem' }} /> 24h Uptime</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn-menu" onClick={() => fetchDeviceHistory(device._id)}>
                                            <FaEllipsisV />
                                        </button>
                                    </div>

                                    {/* Sensors Grid */}
                                    <div className="widget-body">
                                        <div className="sensors-layout">
                                            {(device.sensorOrder || ['temperature', 'humidity', 'ph', 'ec', 'waterLevel', 'lightIntensity']).map((key, sensorIndex, arr) => (
                                                device.sensors && device.sensors[key] !== undefined && (
                                                    <div key={key} className="sensor-item" data-type={key}>
                                                        <div className="sensor-content-wrapper">
                                                            <div className="sensor-icon-wrapper">
                                                                {getSensorIcon(key)}
                                                            </div>
                                                            <div className="sensor-details">
                                                                <div className="val-unit">
                                                                    <span className="sensor-val">{Number(device.sensors[key]).toFixed(1)}</span>
                                                                    <span className="sensor-unit">
                                                                        {key === 'temperature' ? '°C' :
                                                                            key === 'humidity' ? '%' :
                                                                                key === 'ec' ? 'mS' :
                                                                                    key === 'lightIntensity' ? 'lx' :
                                                                                        key === 'waterLevel' ? '%' : ''}
                                                                    </span>
                                                                </div>
                                                                <span className="sensor-lbl">{key === 'lightIntensity' ? 'INTENSITY' : key === 'waterLevel' ? 'WATER LEVEL' : key === 'ph' ? 'PH LEVEL' : key.toUpperCase()}</span>
                                                            </div>
                                                        </div>
                                                        <div className="sensor-reorder-controls">
                                                            {sensorIndex > 0 && (
                                                                <button className="btn-mini-arrow" onClick={() => moveSensor(device._id, sensorIndex, 'left')}>←</button>
                                                            )}
                                                            {sensorIndex < arr.length - 1 && (
                                                                <button className="btn-mini-arrow" onClick={() => moveSensor(device._id, sensorIndex, 'right')}>→</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>

                                    {/* Activity Footer REMOVED */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* History Modal */}
                {showHistoryModal && (
                    <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
                        <div className="modal-content analytics-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{selectedDeviceName} - 24h Data</h3>
                                <button className="btn-close" onClick={() => setShowHistoryModal(false)}>×</button>
                            </div>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <ComposedChart data={selectedDeviceHistory}>
                                        <defs>
                                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="timestamp" stroke="#94a3b8" tickFormatter={(str) => new Date(str).getHours() + ':00'} />
                                        <YAxis yAxisId="left" stroke="#ef4444" domain={[20, 35]} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" domain={[40, 90]} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                        <Area yAxisId="left" type="monotone" dataKey="temperature" stroke="#ef4444" fill="url(#colorTemp)" />
                                        <Area yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" fill="url(#colorHum)" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Issue Modal */}
                {showIssueModal && (
                    <div className="modal-overlay" onClick={() => setShowIssueModal(false)}>
                        <div className="modal-content analytics-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Raise an Issue</h3>
                                <button className="btn-close" onClick={() => setShowIssueModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleIssueSubmit}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                                        Select Device
                                    </label>
                                    <select
                                        value={selectedIssueDevice}
                                        onChange={(e) => setSelectedIssueDevice(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            backgroundColor: '#0f172a',
                                            border: '1px solid #334155',
                                            color: 'white',
                                            fontFamily: 'inherit'
                                        }}
                                        required
                                    >
                                        <option value="" disabled>Select a device...</option>
                                        {devices.map(device => (
                                            <option key={device._id} value={device._id}>
                                                {device.customName || device.deviceName} (ID: {device.serialNumber})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                                        Describe the problem
                                    </label>
                                    <textarea
                                        className="issue-textarea"
                                        rows="5"
                                        placeholder="E.g., Temperature sensor is reading too high..."
                                        value={issueDescription}
                                        onChange={(e) => setIssueDescription(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            backgroundColor: '#0f172a',
                                            border: '1px solid #334155',
                                            color: 'white',
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        style={{ fontSize: '1rem', border: '1px solid #334155', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
                                        onClick={() => setShowIssueModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={issueSubmitting}
                                        style={{
                                            padding: '0.5rem 1.5rem',
                                            borderRadius: '0.5rem',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            fontWeight: '600',
                                            cursor: issueSubmitting ? 'not-allowed' : 'pointer',
                                            opacity: issueSubmitting ? 0.7 : 1
                                        }}
                                    >
                                        {issueSubmitting ? 'Sending...' : 'Report Issue'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Notifications Modal */}
                {showNotificationsModal && (
                    <div className="modal-overlay" onClick={() => setShowNotificationsModal(false)}>
                        <div className="modal-content analytics-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>My Issues & Notifications</h3>
                                <button className="btn-close" onClick={() => setShowNotificationsModal(false)}>×</button>
                            </div>
                            <div className="modal-body" style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
                                {issues.length === 0 ? (
                                    <p style={{ color: '#94a3b8', textAlign: 'center' }}>No issues reported.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {issues.map(issue => (
                                            <div key={issue._id} style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '8px',
                                                padding: '1rem',
                                                border: issue.status === 'Resolved' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: '600', color: 'white' }}>{issue.deviceId?.deviceName || 'Device'}</span>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: '4px',
                                                        background: issue.status === 'Resolved' ? 'rgba(16, 185, 129, 0.2)' :
                                                            issue.status === 'Open' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                        color: issue.status === 'Resolved' ? '#10b981' :
                                                            issue.status === 'Open' ? '#ef4444' : '#f59e0b'
                                                    }}>
                                                        {issue.status}
                                                    </span>
                                                </div>
                                                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{issue.description}</p>
                                                {issue.adminResponse && (
                                                    <div style={{
                                                        marginTop: '0.5rem',
                                                        padding: '0.5rem',
                                                        background: 'rgba(59, 130, 246, 0.1)',
                                                        borderRadius: '4px',
                                                        borderLeft: '3px solid #3b82f6'
                                                    }}>
                                                        <strong style={{ display: 'block', fontSize: '0.8rem', color: '#3b82f6', marginBottom: '0.25rem' }}>Admin Response:</strong>
                                                        <p style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: 0 }}>{issue.adminResponse}</p>
                                                    </div>
                                                )}
                                                <div style={{ textAlign: 'right', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserDashboard;
