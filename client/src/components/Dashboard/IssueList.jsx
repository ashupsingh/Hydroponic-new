import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaCheck, FaReply, FaTimes, FaCircle } from 'react-icons/fa';
import { API_URL } from '../../config';
import './IssueList.css';

const IssueList = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/issues`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setIssues(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleResolve = async (issue, status = 'Resolved') => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/issue/${issue._id}/respond`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                fetchIssues();
                setSelectedIssue(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/issue/${selectedIssue._id}/respond`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    response: responseText,
                    status: 'In Progress' // Automatically mark as In Progress when replying
                })
            });

            if (res.ok) {
                setResponseText('');
                fetchIssues();
                setSelectedIssue(null); // Or keep open?
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredIssues = filterStatus === 'All'
        ? issues
        : issues.filter(i => i.status === filterStatus);

    if (loading) return <div className="loading">Loading issues...</div>;

    return (
        <div className="issue-list-container">
            <div className="issue-filters">
                <button className={filterStatus === 'All' ? 'active' : ''} onClick={() => setFilterStatus('All')}>All</button>
                <button className={filterStatus === 'Open' ? 'active' : ''} onClick={() => setFilterStatus('Open')}>Open</button>
                <button className={filterStatus === 'In Progress' ? 'active' : ''} onClick={() => setFilterStatus('In Progress')}>In Progress</button>
                <button className={filterStatus === 'Resolved' ? 'active' : ''} onClick={() => setFilterStatus('Resolved')}>Resolved</button>
            </div>

            <div className="issues-grid">
                {filteredIssues.map(issue => (
                    <div key={issue._id} className={`issue-card ${issue.status.toLowerCase().replace(' ', '-')}`} onClick={() => setSelectedIssue(issue)}>
                        <div className="issue-header">
                            <span className="issue-id">#{issue._id.slice(-6).toUpperCase()}</span>
                            <span className={`status-badge ${issue.status.toLowerCase().replace(' ', '-')}`}>{issue.status}</span>
                        </div>
                        <div className="issue-content">
                            <p className="description">{issue.description.substring(0, 100)}{issue.description.length > 100 ? '...' : ''}</p>
                        </div>
                        <div className="issue-meta">
                            <div className="user-info">
                                <strong>{issue.userId?.name || 'Unknown'}</strong>
                                <span>{issue.deviceId?.deviceName || 'Unknown Device'}</span>
                            </div>
                            <span className="date">{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
                {filteredIssues.length === 0 && <div className="empty-state">No issues found.</div>}
            </div>

            {selectedIssue && (
                <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
                    <div className="modal-content issue-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Issue Details #{selectedIssue._id.slice(-6)}</h3>
                            <button className="btn-close" onClick={() => setSelectedIssue(null)}><FaTimes /></button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <strong>User:</strong> {selectedIssue.userId?.name} ({selectedIssue.userId?.email})
                            </div>
                            <div className="detail-row">
                                <strong>Device:</strong> {selectedIssue.deviceId?.deviceName || 'N/A'} (SN: {selectedIssue.deviceId?.serialNumber})
                            </div>
                            <div className="detail-row full-width">
                                <strong>Description:</strong>
                                <p className="full-text">{selectedIssue.description}</p>
                            </div>

                            {selectedIssue.adminResponse && (
                                <div className="detail-row full-width response-box">
                                    <strong>Previous Response:</strong>
                                    <p>{selectedIssue.adminResponse}</p>
                                </div>
                            )}

                            <form onSubmit={handleReply} className="reply-form">
                                <textarea
                                    placeholder="Write a response..."
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    className="reply-input"
                                />
                                <div className="action-buttons">
                                    <button type="submit" className="btn-reply">
                                        <FaReply /> Send Reply
                                    </button>
                                    {selectedIssue.status !== 'Resolved' && (
                                        <button
                                            type="button"
                                            className="btn-resolve"
                                            onClick={() => handleResolve(selectedIssue)}
                                        >
                                            <FaCheck /> Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueList;
