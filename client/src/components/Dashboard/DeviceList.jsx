import React, { useState, useEffect } from 'react';
import { FaLeaf, FaArrowLeft, FaTint, FaThermometerHalf, FaSun } from 'react-icons/fa';
import { API_URL } from '../../config';
import SensorGauges from './SensorGauges';

const DeviceList = ({ user, onBack }) => {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDevices = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/admin/devices/${user._id}`, {
                    headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                setDevices(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchDevices();
    }, [user]);

    const handleDeviceClick = (device) => {
        if (selectedDevice && selectedDevice._id === device._id) {
            setSelectedDevice(null); // Toggle off
        } else {
            setSelectedDevice(device);
        }
    };

    if (loading) return <div className="loading">Loading Devices...</div>;

    return (
        <div className="device-list-container">
            <div className="list-header">
                <button className="btn-back" onClick={onBack}><FaArrowLeft /> Back to Users</button>
                <h3>{user.name}'s Devices</h3>
            </div>

            <div className="device-grid">
                {devices.length === 0 && <p className="no-data">No devices assigned to this user.</p>}

                {devices.map(device => (
                    <div key={device._id} className={`device-card ${selectedDevice?._id === device._id ? 'active' : ''}`}>
                        <div className="device-summary" onClick={() => handleDeviceClick(device)}>
                            <div className="device-icon">
                                <FaLeaf />
                            </div>
                            <div className="device-info">
                                <h4>{device.deviceName}</h4>
                                <p>BSN: {device.serialNumber}</p>
                                <span className={`status-badge ${device.status.toLowerCase()}`}>{device.status}</span>
                            </div>
                        </div>

                        {selectedDevice && selectedDevice._id === device._id && (
                            <div className="device-details-panel">
                                <SensorGauges deviceId={device._id} />
                                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                                    <a href={`/admin/device/${device._id}`} className="btn-details-link" style={{ color: '#00e676', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #00e676', padding: '8px 16px', borderRadius: '4px' }}>
                                        View Full Details & Location &rarr;
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeviceList;
