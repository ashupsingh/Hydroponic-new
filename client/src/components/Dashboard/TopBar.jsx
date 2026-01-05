import React from 'react';
import { FaSearch, FaBell, FaCog, FaUserCircle } from 'react-icons/fa';

const TopBar = ({ title, notificationCount, onNotificationClick }) => {
    return (
        <div className="topbar">
            <div className="topbar-left">
                <h2 className="page-title">{title}</h2>
            </div>

            <div className="topbar-right">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input type="text" placeholder="Search anything..." />
                </div>

                <div className="icon-actions">
                    <button className="icon-btn" onClick={onNotificationClick}>
                        <FaBell />
                        {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
                    </button>
                    <button className="icon-btn">
                        <FaCog />
                    </button>
                </div>

                <div className="profile-menu">
                    <div className="user-info-mini">
                        <span className="name">Admin User</span>
                        <span className="role">Premium</span>
                    </div>
                    <FaUserCircle className="profile-icon" />
                </div>
            </div>
        </div>
    );
};

export default TopBar;
