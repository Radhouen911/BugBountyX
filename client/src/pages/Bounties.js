import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Bounties.css";

const Bounties = () => {
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "active",
    severity: "",
    search: "",
  });

  useEffect(() => {
    fetchBounties();
  }, [filters]);

  const fetchBounties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.severity) params.append("severity", filters.severity);
      if (filters.search) params.append("search", filters.search);

      const response = await api.get(`/bounties?${params.toString()}`);
      setBounties(response.data.bounties);
      setError("");
    } catch (err) {
      setError("Failed to load bounties");
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

  if (loading) {
    return <div className="loading">Loading bounties...</div>;
  }

  return (
    <div className="bounties-page">
      <div className="bounties-header">
        <h1>Bug Bounties</h1>
        <p>Find security vulnerabilities and earn rewards</p>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search bounties..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="search-input"
        />

        <select
          value={filters.severity}
          onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          className="filter-select"
        >
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="filter-select"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="bounties-grid">
        {bounties.length === 0 ? (
          <div className="no-bounties">No bounties found</div>
        ) : (
          bounties.map((bounty) => (
            <Link
              to={`/bounties/${bounty._id}`}
              key={bounty._id}
              className="bounty-card"
            >
              <div className="bounty-header">
                <h3>{bounty.title}</h3>
                <span
                  className="severity-badge"
                  style={{ backgroundColor: getSeverityColor(bounty.severity) }}
                >
                  {bounty.severity}
                </span>
              </div>

              <p className="bounty-description">
                {bounty.description.substring(0, 150)}
                {bounty.description.length > 150 ? "..." : ""}
              </p>

              <div className="bounty-footer">
                <div className="reward">
                  <span className="reward-label">Reward:</span>
                  <span className="reward-amount">
                    ${bounty.reward.min} - ${bounty.reward.max}
                  </span>
                </div>

                <div className="bounty-meta">
                  <span>{bounty.submissionCount} submissions</span>
                  {bounty.company && (
                    <span className="company-name">
                      {bounty.company.profile?.company ||
                        bounty.company.username}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Bounties;
