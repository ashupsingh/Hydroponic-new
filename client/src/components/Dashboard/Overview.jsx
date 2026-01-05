import React, { useState, useEffect } from 'react';
import { FaMicrochip, FaExclamationTriangle, FaUsers, FaUserCheck, FaUserTimes, FaTicketAlt, FaCheckCircle, FaClock, FaArrowUp, FaTimes } from 'react-icons/fa';
import { API_URL } from '../../config';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Overview = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeDevices: 0,
        notWorkingDevices: 0,
        usersWithDevices: 0,
        usersWithoutDevices: 0,
        totalIssues: 0,
        resolvedIssues: 0,
        pendingIssues: 0
    });
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalTitle, setModalTitle] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                const statsRes = await fetch(`${API_URL}/api/admin/stats`, {
                    headers: { 'x-auth-token': token }
                });
                const statsData = await statsRes.json();
                setStats(statsData.stats);

                const devicesRes = await fetch(`${API_URL}/api/admin/devices-map`, {
                    headers: { 'x-auth-token': token }
                });
                const devicesData = await devicesRes.json();
                setDevices(devicesData);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleWidgetClick = async (widgetType, title) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/widget/${widgetType}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            console.log(`Widget ${widgetType} clicked:`, data);
            console.log(`Data length: ${data.length}`);
            console.log(`First item:`, data[0]);
            setModalData(data);
            setModalTitle(title);
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching widget data:', err);
        }
    };

    const getMarkerIcon = (status) => {
        const color = status === 'Active' ? 'green' : status === 'Error' ? 'red' : 'orange';
        return new L.Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    };

    const renderModalContent = () => {
        console.log('renderModalContent called');
        console.log('modalData:', modalData);
        console.log('modalData.length:', modalData.length);
        console.log('modalTitle:', modalTitle);

        if (modalData.length === 0) return <p className="no-data">No data available</p>;

        // Users - CHECK THIS FIRST because "Users With Devices" contains "Device"
        if (modalTitle.includes('User')) {
            const showDeviceCount = modalData.length > 0 && modalData[0].deviceCount !== undefined;
            console.log('Rendering User table, showDeviceCount:', showDeviceCount);

            return (
                <table className="detail-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            {showDeviceCount && <th>Devices</th>}
                            {!showDeviceCount && <th>Registered</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {modalData.map((user) => (
                            <tr key={user._id}>
                                <td>{user.name || 'N/A'}</td>
                                <td>{user.email || 'N/A'}</td>
                                {showDeviceCount && <td>{user.deviceCount}</td>}
                                {!showDeviceCount && <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        // Devices
        if (modalTitle.includes('Device')) {
            console.log('Rendering Device table');
            return (
                <table className="detail-table">
                    <thead>
                        <tr>
                            <th>Device Name</th>
                            <th>Serial Number</th>
                            <th>User</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modalData.map((device) => (
                            <tr key={device._id}>
                                <td>{device.deviceName || 'N/A'}</td>
                                <td>{device.serialNumber || 'N/A'}</td>
                                <td>{device.userId?.name || 'N/A'}</td>
                                <td>
                                    {device.status ? (
                                        <span className={`status-badge ${device.status.toLowerCase()}`}>
                                            {device.status}
                                        </span>
                                    ) : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        // Issues/Tickets
        if (modalTitle.includes('Issue')) {
            return (
                <table className="detail-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>User</th>
                            <th>Priority</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modalData.map((ticket) => (
                            <tr key={ticket._id}>
                                <td>{ticket.title || 'N/A'}</td>
                                <td>{ticket.userId?.name || 'N/A'}</td>
                                <td>
                                    {ticket.priority ? (
                                        <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                                            {ticket.priority}
                                        </span>
                                    ) : 'N/A'}
                                </td>
                                <td>
                                    {ticket.status ? (
                                        <span className={`status-badge ${ticket.status.toLowerCase()}`}>
                                            {ticket.status}
                                        </span>
                                    ) : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
    };

    if (loading) return <div className="loading">Loading Real-Time Statistics...</div>;

    return (
        <div className="overview-container">
            {/* Stats Grid - 8 Clickable Widgets */}
            <div className="stats-grid">
                <div className="stat-card" onClick={() => handleWidgetClick('active-devices', 'Active Devices')}>
                    <div className="stat-icon-wrap icon-green"><FaMicrochip /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.activeDevices}</span>
                        <span className="stat-label">Active Devices</span>
                    </div>
                    <div className="stat-trend trend-up"><FaArrowUp /> Online</div>
                </div>

                <div className="stat-card" onClick={() => handleWidgetClick('not-working', 'Not Working Devices')}>
                    <div className="stat-icon-wrap icon-red"><FaExclamationTriangle /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.notWorkingDevices}</span>
                        <span className="stat-label">Not Working</span>
                    </div>
                    <div className="stat-trend trend-down">Offline</div>
                </div>

                <div className="stat-card" onClick={() => handleWidgetClick('total-users', 'All Users')}>
                    <div className="stat-icon-wrap icon-blue"><FaUsers /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalUsers}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                    <div className="stat-trend trend-neutral">Registered</div>
                </div>

                <div className="stat-card" onClick={() => handleWidgetClick('users-with-devices', 'Users With Devices')}>
                    <div className="stat-icon-wrap icon-green"><FaUserCheck /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.usersWithDevices}</span>
                        <span className="stat-label">With Devices</span>
                    </div>
                    <div className="stat-trend trend-up">
                        {stats.totalUsers > 0 ? ((stats.usersWithDevices / stats.totalUsers) * 100).toFixed(0) : 0}%
                    </div>
                </div>

                <div className="stat-card" onClick={() => handleWidgetClick('users-without-devices', 'Users Without Devices')}>
                    <div className="stat-icon-wrap icon-yellow"><FaUserTimes /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.usersWithoutDevices}</span>
                        <span className="stat-label">Without Devices</span>
                    </div>
                    <div className="stat-trend trend-neutral">Pending</div>
                </div>

                <div className="stat-card" onClick={() => handleWidgetClick('total-issues', 'All Issues')}>
                    <div className="stat-icon-wrap icon-blue"><FaTicketAlt /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalIssues}</span>
                        <span className="stat-label">Total Issues</span>
                    </div>
                    <div className="stat-trend trend-neutral">All Time</div>
                </div>

                <div className="stat-card" onClick={() => handleWidgetClick('resolved-issues', 'Resolved Issues')}>
                    <div className="stat-icon-wrap icon-green"><FaCheckCircle /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.resolvedIssues}</span>
                        <span className="stat-label">Resolved</span>
                    </div>
                    <div className="stat-trend trend-up">
                        {stats.totalIssues > 0 ? ((stats.resolvedIssues / stats.totalIssues) * 100).toFixed(0) : 0}%
                    </div>
                </div>

                <div className="stat-card" onClick={() => handleWidgetClick('pending-issues', 'Pending Issues')}>
                    <div className="stat-icon-wrap icon-yellow"><FaClock /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.pendingIssues}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                    <div className="stat-trend trend-down">Action Needed</div>
                </div>
            </div>

            {/* Device Location Map */}
            <div className="map-section">
                <div className="map-header">
                    <h3>Device Locations (India)</h3>
                    <div className="map-legend">
                        <span className="legend-item"><span className="dot green"></span> Active</span>
                        <span className="legend-item"><span className="dot orange"></span> Maintenance</span>
                        <span className="legend-item"><span className="dot red"></span> Error</span>
                    </div>
                </div>
                <div className="map-container-wrapper">
                    {devices.length > 0 ? (
                        <MapContainer
                            center={[20.5937, 78.9629]}
                            zoom={5}
                            style={{ height: '500px', width: '100%', borderRadius: '12px' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {devices.map((device) => (
                                <Marker
                                    key={device._id}
                                    position={[device.location.lat, device.location.lng]}
                                    icon={getMarkerIcon(device.status)}
                                >
                                    <Popup>
                                        <div style={{ minWidth: '200px' }}>
                                            <h4 style={{ margin: '0 0 8px 0', color: '#00e676' }}>{device.deviceName}</h4>
                                            <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                                                <strong>User:</strong> {device.userId?.name || 'Unknown'}
                                            </p>
                                            <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                                                <strong>Status:</strong> <span style={{
                                                    color: device.status === 'Active' ? '#00e676' : device.status === 'Error' ? '#ff5252' : '#ffd740'
                                                }}>{device.status}</span>
                                            </p>
                                            <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                                                <strong>Location:</strong> {device.location.address}
                                            </p>
                                            <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                                                <strong>Temp:</strong> {device.sensors?.temperature}°C
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    ) : (
                        <div className="no-map">No devices with location data available</div>
                    )}
                </div>
            </div>

            {/* Widget Detail Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{modalTitle}</h3>
                            <button className="btn-close" onClick={() => setShowModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            {renderModalContent()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Overview;
