import React, { useState, useEffect } from 'react';
import { FaThermometerHalf, FaTint, FaFlask, FaBolt, FaLightbulb, FaWater } from 'react-icons/fa';
import { API_URL } from '../../config';

const SensorGauges = ({ deviceId }) => {
    const [sensors, setSensors] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSensorData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/device/${deviceId}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setSensors(data.sensors);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSensorData();
        const interval = setInterval(fetchSensorData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [deviceId]);

    if (loading) return <div className="loading-small">Syncing Sensors...</div>;

    const Gauge = ({ label, value, unit, icon, color }) => (
        <div className="sensor-card">
            <div className="sensor-icon" style={{ color: color }}>{icon}</div>
            <div className="sensor-data">
                <span className="sensor-value">{value}</span>
                <span className="sensor-unit">{unit}</span>
            </div>
            <span className="sensor-label">{label}</span>
            <div className="sensor-bar">
                <div className="sensor-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }}></div>
            </div>
        </div>
    );

    return (
        <div className="sensor-grid">
            <Gauge label="Temperature" value={sensors.temperature} unit="°C" icon={<FaThermometerHalf />} color="#ff5252" />
            <Gauge label="Humidity" value={sensors.humidity} unit="%" icon={<FaTint />} color="#40c4ff" />
            <Gauge label="pH Level" value={sensors.ph} unit="pH" icon={<FaFlask />} color="#69f0ae" />
            <Gauge label="EC" value={sensors.ec} unit="mS/cm" icon={<FaBolt />} color="#ffd740" />
            <Gauge label="Water Level" value={sensors.waterLevel} unit="%" icon={<FaWater />} color="#448aff" />
            <Gauge label="Light Intensity" value={sensors.lightIntensity} unit="Lux" icon={<FaLightbulb />} color="#ffab00" />
        </div>
    );
};

export default SensorGauges;
