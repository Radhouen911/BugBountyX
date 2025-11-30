import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import "./BountyDetail.css";

const BountyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bounty, setBounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "medium",
    steps: "",
    impact: "",
  });

  useEffect(() => {
    fetchBounty();
  }, [id]);

  const fetchBounty = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bounties/${id}`);
      setBounty(response.data.bounty);
      setError("");
    } catch (err) {
      setError("Failed to load bounty details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "researcher") {
      setError("Only researchers can submit vulnerabilities");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/submissions", {
        bountyId: id,
        ...formData,
      });
      alert("Vulnerability submitted successfully!");
      setShowSubmitForm(false);
      setFormData({
        title: "",
        description: "",
        severity: "medium",
        steps: "",
        impact: "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit vulnerability");
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return <div className="loading">Loading bounty details...</div>;
  }

  if (error && !bounty) {
    return <div className="error-page">{error}</div>;
  }

  if (!bounty) {
    return <div className="error-page">Bounty not found</div>;
  }

  return (
    <div className="bounty-detail-page">
      <div className="bounty-detail-container">
        <div className="bounty-detail-header">
          <div>
            <h1>{bounty.title}</h1>
            <div className="bounty-meta">
              <span
                className="severity-badge"
                style={{ backgroundColor: getSeverityColor(bounty.severity) }}
              >
                {bounty.severity}
              </span>
              <span className="status-badge">{bounty.status}</span>
              {bounty.company && (
                <span className="company-info">
                  by{" "}
                  {bounty.company.profile?.company || bounty.company.username}
                </span>
              )}
            </div>
          </div>

          <div className="reward-box">
            <div className="reward-label">Reward</div>
            <div className="reward-amount">
              ${bounty.reward.min} - ${bounty.reward.max}
            </div>
            <div className="reward-currency">{bounty.reward.currency}</div>
          </div>
        </div>

        <div className="bounty-content">
          <section className="bounty-section">
            <h2>Description</h2>
            <p>{bounty.description}</p>
          </section>

          {bounty.scope && (
            <section className="bounty-section">
              <h2>Scope</h2>
              {bounty.scope.domains && bounty.scope.domains.length > 0 && (
                <div>
                  <h3>In Scope Domains:</h3>
                  <ul>
                    {bounty.scope.domains.map((domain, idx) => (
                      <li key={idx}>{domain}</li>
                    ))}
                  </ul>
                </div>
              )}
              {bounty.scope.excludedDomains &&
                bounty.scope.excludedDomains.length > 0 && (
                  <div>
                    <h3>Out of Scope:</h3>
                    <ul>
                      {bounty.scope.excludedDomains.map((domain, idx) => (
                        <li key={idx}>{domain}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </section>
          )}

          <section className="bounty-section">
            <h2>Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{bounty.submissionCount}</div>
                <div className="stat-label">Total Submissions</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{bounty.validSubmissionCount}</div>
                <div className="stat-label">Valid Submissions</div>
              </div>
            </div>
          </section>

          {user && user.role === "researcher" && bounty.status === "active" && (
            <div className="submit-section">
              {!showSubmitForm ? (
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="btn btn-primary"
                >
                  Submit Vulnerability
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="submit-form">
                  <h2>Submit Vulnerability</h2>

                  {error && <div className="error-message">{error}</div>}

                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      minLength={5}
                      maxLength={200}
                    />
                  </div>

                  <div className="form-group">
                    <label>Severity *</label>
                    <select
                      value={formData.severity}
                      onChange={(e) =>
                        setFormData({ ...formData, severity: e.target.value })
                      }
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                      minLength={20}
                      maxLength={10000}
                      rows={6}
                    />
                  </div>

                  <div className="form-group">
                    <label>Steps to Reproduce *</label>
                    <textarea
                      value={formData.steps}
                      onChange={(e) =>
                        setFormData({ ...formData, steps: e.target.value })
                      }
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={6}
                    />
                  </div>

                  <div className="form-group">
                    <label>Impact *</label>
                    <textarea
                      value={formData.impact}
                      onChange={(e) =>
                        setFormData({ ...formData, impact: e.target.value })
                      }
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={4}
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSubmitForm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BountyDetail;
