import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaArrowLeft, FaThermometerHalf, FaTint, FaFlask, FaBolt, FaWater, FaLightbulb } from 'react-icons/fa';
import { API_URL } from '../../config';
import SortableSensor from './SortableSensor';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DeviceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [device, setDevice] = useState(null);
    const [sensorOrder, setSensorOrder] = useState(['temperature', 'humidity', 'ph', 'ec', 'waterLevel', 'lightIntensity']);
    const [history, setHistory] = useState([]);
    const [timeRange, setTimeRange] = useState(24);
    const [loading, setLoading] = useState(true);

    const sensorConfig = {
        temperature: { label: 'Temperature', unit: '°C', icon: <FaThermometerHalf />, color: '#ff5252' },
        humidity: { label: 'Humidity', unit: '%', icon: <FaTint />, color: '#40c4ff' },
        ph: { label: 'pH Level', unit: 'pH', icon: <FaFlask />, color: '#69f0ae' },
        ec: { label: 'EC', unit: 'mS/cm', icon: <FaBolt />, color: '#ffd740' },
        waterLevel: { label: 'Water Level', unit: '%', icon: <FaWater />, color: '#448aff' },
        lightIntensity: { label: 'Light Intensity', unit: 'Lux', icon: <FaLightbulb />, color: '#ffab00' }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch device details
                const deviceRes = await fetch(`${API_URL}/api/admin/device/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                const deviceData = await deviceRes.json();
                setDevice(deviceData);

                // Fetch sensor history
                const historyRes = await fetch(`${API_URL}/api/admin/devices/${id}/history?hours=${timeRange}`, {
                    headers: { 'x-auth-token': token }
                });
                const historyData = await historyRes.json();

                // Format for charts
                const formatted = historyData.map(reading => ({
                    ...reading,
                    time: new Date(reading.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }));
                setHistory(formatted);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id, timeRange]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setSensorOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    if (loading) return <div className="loading">Loading Device Details...</div>;
    if (!device) return <div className="no-data">Device not found</div>;

    return (
        <div className="device-detail-page">
            <header className="detail-header">
                <button className="btn-back" onClick={() => navigate('/admin')}><FaArrowLeft /> Back to Dashboard</button>
                <div className="header-info">
                    <h2>{device.deviceName}</h2>
                    <span className="serial">{device.serialNumber}</span>
                </div>
            </header>

            <div className="detail-content">
                <div className="sensors-section">
                    <h3>Live Sensor Metrics (Drag to Reorder)</h3>
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={sensorOrder} strategy={rectSortingStrategy}>
                            <div className="sensor-grid-draggable">
                                {sensorOrder.map((key) => {
                                    const conf = sensorConfig[key];
                                    const val = device.sensors[key];
                                    return (
                                        <SortableSensor key={key} id={key}>
                                            <div className="sensor-card draggable">
                                                <div className="sensor-icon" style={{ color: conf.color }}>{conf.icon}</div>
                                                <div className="sensor-data">
                                                    <span className="sensor-value">{val}</span>
                                                    <span className="sensor-unit">{conf.unit}</span>
                                                </div>
                                                <span className="sensor-label">{conf.label}</span>
                                            </div>
                                        </SortableSensor>
                                    );
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {/* Sensor History Charts */}
                    <div className="history-section">
                        <div className="history-header">
                            <h3>Sensor History</h3>
                            <div className="time-selector">
                                <button className={`time-btn ${timeRange === 6 ? 'active' : ''}`} onClick={() => setTimeRange(6)}>6h</button>
                                <button className={`time-btn ${timeRange === 12 ? 'active' : ''}`} onClick={() => setTimeRange(12)}>12h</button>
                                <button className={`time-btn ${timeRange === 24 ? 'active' : ''}`} onClick={() => setTimeRange(24)}>24h</button>
                            </div>
                        </div>
                        <div className="chart-grid">
                            {/* Temperature Chart */}
                            <div className="chart-card">
                                <h4>Temperature Trend</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={history}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2c303a" />
                                        <XAxis dataKey="time" stroke="#6c757d" />
                                        <YAxis stroke="#6c757d" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e232e', border: '1px solid #2c303a' }} />
                                        <Line type="monotone" dataKey="temperature" stroke="#ff5252" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Humidity Chart */}
                            <div className="chart-card">
                                <h4>Humidity Trend</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={history}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2c303a" />
                                        <XAxis dataKey="time" stroke="#6c757d" />
                                        <YAxis stroke="#6c757d" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e232e', border: '1px solid #2c303a' }} />
                                        <Line type="monotone" dataKey="humidity" stroke="#40c4ff" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* pH Chart */}
                            <div className="chart-card">
                                <h4>pH Level Trend</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={history}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2c303a" />
                                        <XAxis dataKey="time" stroke="#6c757d" />
                                        <YAxis stroke="#6c757d" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e232e', border: '1px solid #2c303a' }} />
                                        <Line type="monotone" dataKey="ph" stroke="#69f0ae" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* EC Chart */}
                            <div className="chart-card">
                                <h4>EC Trend</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={history}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2c303a" />
                                        <XAxis dataKey="time" stroke="#6c757d" />
                                        <YAxis stroke="#6c757d" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e232e', border: '1px solid #2c303a' }} />
                                        <Line type="monotone" dataKey="ec" stroke="#ffd740" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="meta-section">
                    <div className="location-card">
                        <h3>Device Location</h3>
                        <div className="map-wrapper">
                            {device.location && device.location.lat ? (
                                <MapContainer center={[device.location.lat, device.location.lng]} zoom={13} style={{ height: '300px', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[device.location.lat, device.location.lng]}>
                                        <Popup>{device.location.address || device.deviceName}</Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <div className="no-map">Location not available for this device.</div>
                            )}
                        </div>
                        <div className="address-box">
                            <p><strong>Address:</strong> {device.location?.address || 'Unknown'}</p>
                            <p><strong>Coordinates:</strong> {device.location?.lat}, {device.location?.lng}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeviceDetail;
