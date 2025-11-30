import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("submissions");
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [updateForm, setUpdateForm] = useState({
    status: "",
    adminNotes: "",
    rewardAmount: "",
  });

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "submissions") {
      fetchSubmissions();
    } else if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, statusFilter]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data.statistics);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const response = await api.get(`/admin/submissions${params}`);
      setSubmissions(response.data.submissions);
      setError("");
    } catch (err) {
      setError("Failed to load submissions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      setUsers(response.data.users);
      setError("");
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setUpdateForm({
      status: submission.status,
      adminNotes: submission.adminNotes || "",
      rewardAmount: submission.reward?.amount || "",
    });
  };

  const handleUpdateSubmission = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      const updateData = {
        status: updateForm.status,
        adminNotes: updateForm.adminNotes,
      };

      if (updateForm.rewardAmount) {
        updateData.reward = {
          amount: Number(updateForm.rewardAmount),
          currency: "USD",
        };
      }

      await api.put(`/admin/submissions/${selectedSubmission._id}`, updateData);
      alert("Submission updated successfully!");
      setSelectedSubmission(null);
      fetchSubmissions();
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update submission");
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          currentStatus ? "deactivate" : "activate"
        } this user?`
      )
    ) {
      return;
    }

    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      alert("User status updated successfully!");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update user status");
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: "#4caf50",
      medium: "#ff9800",
      high: "#ff5722",
      critical: "#f44336",
    };
    return colors[severity] || "#999";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user || user.role !== "admin") {
    return <div className="error-page">Access denied. Admin only.</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage submissions, users, and platform statistics</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Bounties</h3>
            <div className="stat-value">{stats.totalBounties}</div>
          </div>
          <div className="stat-card">
            <h3>Active Bounties</h3>
            <div className="stat-value">{stats.activeBounties}</div>
          </div>
          <div className="stat-card">
            <h3>Total Submissions</h3>
            <div className="stat-value">{stats.totalSubmissions}</div>
          </div>
          <div className="stat-card">
            <h3>Pending Review</h3>
            <div className="stat-value">{stats.pendingSubmissions}</div>
          </div>
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <h3>Companies</h3>
            <div className="stat-value">{stats.totalCompanies}</div>
          </div>
          <div className="stat-card">
            <h3>Researchers</h3>
            <div className="stat-value">{stats.totalResearchers}</div>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`tab-button ${
            activeTab === "submissions" ? "active" : ""
          }`}
          onClick={() => setActiveTab("submissions")}
        >
          Submissions
        </button>
        <button
          className={`tab-button ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
      </div>

      <div className="tab-content">
        {error && <div className="error-message">{error}</div>}

        {activeTab === "submissions" && (
          <>
            <div className="filters">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="triaging">Triaging</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {loading ? (
              <div className="loading">Loading submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="no-data">No submissions found</div>
            ) : (
              <table className="submissions-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Bounty</th>
                    <th>Researcher</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission._id}>
                      <td>{submission.title}</td>
                      <td>{submission.bounty?.title || "N/A"}</td>
                      <td>{submission.researcher?.username || "N/A"}</td>
                      <td>
                        <span
                          className="severity-badge"
                          style={{
                            backgroundColor: getSeverityColor(
                              submission.severity
                            ),
                          }}
                        >
                          {submission.severity}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${submission.status}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td>{formatDate(submission.createdAt)}</td>
                      <td>
                        <button
                          className="action-button view"
                          onClick={() => handleViewSubmission(submission)}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeTab === "users" && (
          <>
            {loading ? (
              <div className="loading">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="no-data">No users found</div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Reputation</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>{u.role}</span>
                      </td>
                      <td>{u.reputation || 0}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            u.isActive ? "accepted" : "rejected"
                          }`}
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <button
                          className={`action-button toggle ${
                            u.isActive ? "active" : "inactive"
                          }`}
                          onClick={() =>
                            handleToggleUserStatus(u._id, u.isActive)
                          }
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {selectedSubmission && (
        <div
          className="submission-modal"
          onClick={() => setSelectedSubmission(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Submission</h2>
              <button
                className="close-button"
                onClick={() => setSelectedSubmission(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-section">
              <h3>{selectedSubmission.title}</h3>
              <div style={{ marginBottom: "1rem" }}>
                <span
                  className="severity-badge"
                  style={{
                    backgroundColor: getSeverityColor(
                      selectedSubmission.severity
                    ),
                  }}
                >
                  {selectedSubmission.severity}
                </span>
                <span
                  className={`status-badge ${selectedSubmission.status}`}
                  style={{ marginLeft: "0.5rem" }}
                >
                  {selectedSubmission.status}
                </span>
              </div>
            </div>

            <div className="modal-section">
              <h3>Description</h3>
              <p>{selectedSubmission.description}</p>
            </div>

            <div className="modal-section">
              <h3>Steps to Reproduce</h3>
              <p>{selectedSubmission.steps}</p>
            </div>

            <div className="modal-section">
              <h3>Impact</h3>
              <p>{selectedSubmission.impact}</p>
            </div>

            <form onSubmit={handleUpdateSubmission} className="admin-form">
              <h3>Update Submission</h3>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={updateForm.status}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, status: e.target.value })
                  }
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="triaging">Triaging</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="duplicate">Duplicate</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reward Amount ($)</label>
                <input
                  type="number"
                  value={updateForm.rewardAmount}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      rewardAmount: e.target.value,
                    })
                  }
                  min="0"
                  step="1"
                  placeholder="Enter reward amount"
                />
              </div>

              <div className="form-group">
                <label>Admin Notes</label>
                <textarea
                  value={updateForm.adminNotes}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, adminNotes: e.target.value })
                  }
                  rows={4}
                  placeholder="Add notes about this submission..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Update Submission
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
