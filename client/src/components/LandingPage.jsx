import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrochip, FaTint, FaLightbulb, FaChartLine, FaMobileAlt, FaLock } from 'react-icons/fa';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Precision Hydroponics,<br />
                        <span className="gradient-text">Powered by AI</span>
                    </h1>
                    <p className="hero-subtitle">
                        Next-generation automation for Hydroponic and Aeroponic systems.
                        Maximize yields, minimize resource usage, and control your farm from anywhere.
                    </p>
                    <div className="hero-actions">
                        <button className="btn btn-primary">Discover Solutions</button>
                        <button className="btn btn-outline">Watch Demo</button>
                    </div>

                    <div className="hero-stats grid grid-3">
                        <div className="stat-item">
                            <h3>40%</h3>
                            <p>Less Water Usage</p>
                        </div>
                        <div className="stat-item">
                            <h3>2x</h3>
                            <p>Faster Growth Cycles</p>
                        </div>
                        <div className="stat-item">
                            <h3>24/7</h3>
                            <p>Automated Monitoring</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solutions Section */}
            <section id="solutions" className="section bg-card-alt">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="title">Tailored Solutions</h2>
                        <p className="subtitle">Scalable systems designed for every level of agriculture.</p>
                    </div>

                    <div className="solutions-grid grid grid-3">
                        <div className="solution-card">
                            <div className="solution-icon">🏢</div>
                            <h3>Commercial Farms</h3>
                            <p>Industrial-grade automation for high-volume vertical farms. Maximize specific crop yields with custom recipes.</p>
                            <a href="#commercial" className="learn-more">Learn More &rarr;</a>
                        </div>
                        <div className="solution-card">
                            <div className="solution-icon">🏡</div>
                            <h3>Home Growers</h3>
                            <p>Compact, silent, and beautiful units for your kitchen or living room. Grow fresh herbs and leafy greens year-round.</p>
                            <a href="#home-grow" className="learn-more">Learn More &rarr;</a>
                        </div>
                        <div className="solution-card">
                            <div className="solution-icon">🔬</div>
                            <h3>Research Labs</h3>
                            <p>Precision control environments for agricultural universities and biotech firms. Isolate variables with 99.9% accuracy.</p>
                            <a href="#research" className="learn-more">Learn More &rarr;</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Farming Technologies Section */}
            <section id="technologies" className="section bg-darker">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="title">Advanced Farming Technologies</h2>
                        <p className="subtitle">We empower two of the most efficient soil-less cultivation methods.</p>
                    </div>

                    <div className="tech-showcase grid grid-2">
                        <div className="tech-card card">
                            <div className="card-image hydro-img"></div>
                            <div className="card-body">
                                <h3>Hydroponics Mastery</h3>
                                <p>
                                    Our precision hydroponic systems deliver nutrient-rich solutions directly to the root zone.
                                    By eliminating soil, we reduce pests and optimize nutrient uptake.
                                </p>
                                <ul className="tech-features">
                                    <li>✔ NFT & Deep Water Culture Support</li>
                                    <li>✔ Automated pH & EC Balancing</li>
                                    <li>✔ Water Recirculation Systems</li>
                                </ul>
                            </div>
                        </div>

                        <div className="tech-card card">
                            <div className="card-image aero-img"></div>
                            <div className="card-body">
                                <h3>Aeroponics Innovation</h3>
                                <p>
                                    Experience the pinnacle of oxygenation. Our aeroponic misting technology suspends roots in air,
                                    allowing for maximum oxygen absorption and rapid growth rates.
                                </p>
                                <ul className="tech-features">
                                    <li>✔ High-Pressure Misting Nozzles</li>
                                    <li>✔ Root Chamber Climate Control</li>
                                    <li>✔ Zero-Waste Nutrient Delivery</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section id="process" className="section process-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="title">The Automation Process</h2>
                        <p className="subtitle">From seed to harvest, our OS handles the complexity.</p>
                    </div>

                    <div className="process-steps">
                        <div className="step">
                            <div className="step-number">01</div>
                            <h3>Sensors & Monitoring</h3>
                            <p>IoT sensors track humidity, temperature, light intensity, and water quality in real-time.</p>
                        </div>
                        <div className="step-line"></div>
                        <div className="step">
                            <div className="step-number">02</div>
                            <h3>AI Analysis</h3>
                            <p>Our Cloud AI analyzes data patterns to predict plant needs and detect anomalies before they become issues.</p>
                        </div>
                        <div className="step-line"></div>
                        <div className="step">
                            <div className="step-number">03</div>
                            <h3>Actuation</h3>
                            <p>The system automatically adjusts pumps, lights, and fans to maintain the perfect growing environment.</p>
                        </div>
                        <div className="step-line"></div>
                        <div className="step">
                            <div className="step-number">04</div>
                            <h3>Harvest Data</h3>
                            <p>Track yields and optimize future cycles based on comprehensive growth logs and analytics.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Automation Devices Section */}
            <section id="products" className="section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="title">Our Automation Ecosystem</h2>
                    </div>

                    <div className="products-grid grid grid-3">
                        <div className="product-card card">
                            <div className="icon-box"><FaMicrochip size={40} /></div>
                            <h3>Greeva Core Controller</h3>
                            <p>The brain of your farm. Connects up to 50 sensors and actuators with edge computing capabilities.</p>
                        </div>
                        <div className="product-card card">
                            <div className="icon-box"><FaTint size={40} /></div>
                            <h3>Smart Dosing Unit</h3>
                            <p>Precision peristaltic pumps for exact nutrient mixing and pH correction without human intervention.</p>
                        </div>
                        <div className="product-card card">
                            <div className="icon-box"><FaLightbulb size={40} /></div>
                            <h3>Adaptive Lighting Hub</h3>
                            <p>Control LED spectrum and intensity based on plant growth stage and natural light availability.</p>
                        </div>
                        <div className="product-card card">
                            <div className="icon-box"><FaChartLine size={40} /></div>
                            <h3>Atmosphere Station</h3>
                            <p>Monitors CO2, VPD, Temperature, and Humidity. Integrates with HVAC for total climate control.</p>
                        </div>
                        <div className="product-card card">
                            <div className="icon-box"><FaMobileAlt size={40} /></div>
                            <h3>Mobile Dashboard</h3>
                            <p>Complete control in your pocket. Real-time alerts, live camera feeds, and manual overrides.</p>
                        </div>
                        <div className="product-card card">
                            <div className="icon-box"><FaLock size={40} /></div>
                            <h3>Security Module</h3>
                            <p>Biometric access control and perimeter monitoring to keep your high-value crops safe.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
