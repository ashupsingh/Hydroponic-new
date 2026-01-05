import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-top grid grid-4">
                    <div className="footer-brand">
                        <div className="logo mb-2">
                            <span className="logo-icon">🌿</span>
                            <span className="logo-text">Greeva<span className="logo-highlight">Tech</span></span>
                        </div>
                        <p className="text-muted">
                            Pioneering the future of vertical farming with advanced automation and sustainable hydroponic solutions.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4>Solutions</h4>
                        <ul>
                            <li><a href="#">Hydroponic Systems</a></li>
                            <li><a href="#">Aeroponic Frames</a></li>
                            <li><a href="#">Climate Control</a></li>
                            <li><a href="#">Nutrient Dosing</a></li>
                            <li><a href="#">Farm Management OS</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Press</a></li>
                            <li><a href="#">Partners</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Connect</h4>
                        <ul>
                            <li><a href="#">Contact Support</a></li>
                            <li><a href="#">Sales Inquiry</a></li>
                            <li><a href="#">Twitter</a></li>
                            <li><a href="#">LinkedIn</a></li>
                            <li><a href="#">Instagram</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 GreevaTech Automation. All rights reserved.</p>
                    <div className="footer-legal">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
