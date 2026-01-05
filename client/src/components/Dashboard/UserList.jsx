import React, { useState, useEffect } from 'react';
import { FaUser, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { API_URL } from '../../config';
import './UserList.css';

const UserList = ({ onSelectUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [availableDevices, setAvailableDevices] = useState([]);
    const [assignedDevices, setAssignedDevices] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const timestamp = new Date().getTime(); // Cache buster
            const res = await fetch(`${API_URL}/api/admin/users?t=${timestamp}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            console.log('Fetched users:', data); // Debug log
            console.log('First user:', data[0]); // Check first user
            setUsers(data); // Already sorted by newest first
            setLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            setLoading(false);
        }
    };

    const handleUserClick = async (user) => {
        setSelectedUser(user);
        setShowAssignModal(true);

        // Fetch available devices and user's assigned devices
        try {
            const token = localStorage.getItem('token');

            // Get available devices
            const availableRes = await fetch(`${API_URL}/api/admin/available-devices`, {
                headers: { 'x-auth-token': token }
            });
            const availableData = await availableRes.json();
            setAvailableDevices(availableData);

            // Get all devices to find user's assigned ones
            const allDevicesRes = await fetch(`${API_URL}/api/admin/devices`, {
                headers: { 'x-auth-token': token }
            });
            const allDevices = await allDevicesRes.json();
            const userDevices = allDevices.filter(d => d.userId && d.userId.toString() === user._id.toString());
            setAssignedDevices(userDevices);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssignDevice = async (deviceId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/admin/assign-device`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ userId: selectedUser._id, deviceId })
            });

            // Refresh data
            await fetchUsers();
            await handleUserClick(selectedUser);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUnassignDevice = async (deviceId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/admin/unassign-device`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ deviceId })
            });

            // Refresh data
            await fetchUsers();
            await handleUserClick(selectedUser);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRegisterAssign = async (deviceData) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/register-assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    userId: selectedUser._id,
                    ...deviceData
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                alert(errData.msg || 'Error registering device');
                return;
            }

            // Refresh data
            await fetchUsers();
            await handleUserClick(selectedUser);
            // Optional: clear form logic here if simple form ref handling
        } catch (err) {
            console.error(err);
            alert('Failed to register device');
        }
    };

    const handleDeleteUser = async (userId, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="user-list-container">
            <div className="list-header">
                <input
                    type="text"
                    placeholder="Search anything..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="users-grid">
                {filteredUsers.map(user => (
                    <div
                        key={user._id}
                        className={`user-card ${user.isNew ? 'is-new' : ''}`}
                        onClick={() => handleUserClick(user)}
                    >
                        <div className="user-avatar">
                            <FaUser />
                        </div>
                        <div className="user-info">
                            <div className="name-row">
                                <h3>{user.name}</h3>
                                {user.isNew && <span className="new-tag">NEW</span>}
                            </div>
                            <p className="user-email">{user.email}</p>
                            <p className="device-count">{user.deviceCount || 0} Devices</p>
                        </div>
                        <button
                            className="btn-assign-trigger"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleUserClick(user);
                            }}
                            title="Assign Device"
                        >
                            <FaPlus />
                        </button>
                        <button
                            className="btn-delete"
                            onClick={(e) => handleDeleteUser(user._id, e)}
                            title="Delete User"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
            </div>

            {/* Device Assignment Modal */}
            {showAssignModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal-content device-assign-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Manage Devices - {selectedUser.name}</h2>
                            <button className="btn-close" onClick={() => setShowAssignModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Register New Device Form */}
                            <div className="device-section register-section">
                                <h3>Register & Assign New Device</h3>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    handleRegisterAssign({
                                        deviceName: formData.get('deviceName'),
                                        serialNumber: formData.get('serialNumber'),
                                        lat: formData.get('lat'),
                                        lng: formData.get('lng')
                                    });
                                }} className="register-form">
                                    <div className="form-group">
                                        <input type="text" name="deviceName" placeholder="Device Name" required />
                                        <input type="text" name="serialNumber" placeholder="Device Number (Serial)" required />
                                    </div>
                                    <div className="form-group">
                                        <input type="number" step="any" name="lat" placeholder="Latitude" required />
                                        <input type="number" step="any" name="lng" placeholder="Longitude" required />
                                    </div>
                                    <button type="submit" className="btn-register">
                                        <FaPlus /> Register & Assign
                                    </button>
                                </form>
                            </div>

                            {/* Assigned Devices */}
                            <div className="device-section">
                                <h3>Assigned Devices ({assignedDevices.length})</h3>
                                {assignedDevices.length === 0 ? (
                                    <p className="empty-message">No devices assigned yet</p>
                                ) : (
                                    <div className="device-list">
                                        {assignedDevices.map(device => (
                                            <div key={device._id} className="device-item">
                                                <div className="device-info">
                                                    <strong>{device.deviceName}</strong>
                                                    <span className="device-serial">SN: {device.serialNumber}</span>
                                                    {device.location && (
                                                        <span className="device-location">
                                                            Loc: {device.location.lat}, {device.location.lng}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    className="btn-unassign"
                                                    onClick={() => handleUnassignDevice(device._id)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Available Devices */}
                            <div className="device-section">
                                <h3>Assign Existing Device ({availableDevices.length})</h3>
                                {availableDevices.length === 0 ? (
                                    <p className="empty-message">No available devices</p>
                                ) : (
                                    <div className="device-list">
                                        {availableDevices.map(device => (
                                            <div key={device._id} className="device-item">
                                                <div className="device-info">
                                                    <strong>{device.deviceName}</strong>
                                                    <span className="device-serial">SN: {device.serialNumber}</span>
                                                </div>
                                                <button
                                                    className="btn-assign"
                                                    onClick={() => handleAssignDevice(device._id)}
                                                >
                                                    <FaPlus /> Assign
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
