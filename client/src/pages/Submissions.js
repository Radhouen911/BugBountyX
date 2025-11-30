import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import "./Submissions.css";

const Submissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let endpoint = "";

      if (user.role === "researcher") {
        endpoint = "/submissions/researcher/mine";
      } else if (user.role === "company") {
        endpoint = "/submissions/company/received";
      } else {
        setError("Invalid user role");
        return;
      }

      const response = await api.get(endpoint);
      setSubmissions(response.data.submissions);
      setError("");
    } catch (err) {
      setError("Failed to load submissions");
      console.error(err);
    } finally {
      setLoading(false);
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

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === "all") return true;
    return sub.status === filter;
  });

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  return (
    <div className="submissions-page">
      <div className="submissions-header">
        <h1>
          {user.role === "researcher"
            ? "My Submissions"
            : "Received Submissions"}
        </h1>
        <p>
          {user.role === "researcher"
            ? "Track your vulnerability submissions"
            : "Review vulnerability reports from researchers"}
        </p>
      </div>

      <div className="submissions-filters">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="triaging">Triaging</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="submissions-list">
        {filteredSubmissions.length === 0 ? (
          <div className="no-submissions">
            {filter === "all"
              ? "No submissions found"
              : `No ${filter} submissions found`}
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <div
              key={submission._id}
              className="submission-card"
              onClick={() => setSelectedSubmission(submission)}
            >
              <div className="submission-header">
                <div className="submission-title">
                  <h3>{submission.title}</h3>
                  {submission.bounty && (
                    <div className="submission-bounty">
                      Bounty: {submission.bounty.title}
                    </div>
                  )}
                </div>
                <div className="submission-badges">
                  <span
                    className="severity-badge"
                    style={{
                      backgroundColor: getSeverityColor(submission.severity),
                    }}
                  >
                    {submission.severity}
                  </span>
                  <span className={`status-badge ${submission.status}`}>
                    {submission.status}
                  </span>
                </div>
              </div>

              <p className="submission-description">
                {submission.description.substring(0, 200)}
                {submission.description.length > 200 ? "..." : ""}
              </p>

              <div className="submission-footer">
                <div className="submission-date">
                  <span>Submitted: {formatDate(submission.createdAt)}</span>
                  {user.role === "company" && submission.researcher && (
                    <span> • By: {submission.researcher.username}</span>
                  )}
                </div>
                {submission.reward?.amount && (
                  <div className="submission-reward">
                    ${submission.reward.amount}{" "}
                    {submission.reward.paid ? "(Paid)" : ""}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedSubmission && (
        <div
          className="submission-modal"
          onClick={() => setSelectedSubmission(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedSubmission.title}</h2>
              <button
                className="close-button"
                onClick={() => setSelectedSubmission(null)}
              >
                ×
              </button>
            </div>

            <div
              className="submission-badges"
              style={{ marginBottom: "1.5rem" }}
            >
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
              <span className={`status-badge ${selectedSubmission.status}`}>
                {selectedSubmission.status}
              </span>
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

            {selectedSubmission.adminNotes && (
              <div className="modal-section">
                <h3>Admin Notes</h3>
                <p>{selectedSubmission.adminNotes}</p>
              </div>
            )}

            {selectedSubmission.reward?.amount && (
              <div className="modal-section">
                <h3>Reward</h3>
                <p>
                  ${selectedSubmission.reward.amount}{" "}
                  {selectedSubmission.reward.currency}
                  {selectedSubmission.reward.paid && " (Paid)"}
                </p>
              </div>
            )}

            <div className="modal-section">
              <h3>Submission Details</h3>
              <p>
                Submitted: {formatDate(selectedSubmission.createdAt)}
                <br />
                {selectedSubmission.reviewedAt && (
                  <>Reviewed: {formatDate(selectedSubmission.reviewedAt)}</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;
