import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import "./CreateBounty.css";

const CreateBounty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rewardMin: "",
    rewardMax: "",
    severity: "medium",
    domains: "",
    excludedDomains: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "company") {
      setError("Only companies can create bounties");
      return;
    }

    if (Number(formData.rewardMin) > Number(formData.rewardMax)) {
      setError("Minimum reward cannot be greater than maximum reward");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const bountyData = {
        title: formData.title,
        description: formData.description,
        reward: {
          min: Number(formData.rewardMin),
          max: Number(formData.rewardMax),
          currency: "USD",
        },
        severity: formData.severity,
        scope: {
          domains: formData.domains
            .split("\n")
            .map((d) => d.trim())
            .filter((d) => d),
          excludedDomains: formData.excludedDomains
            .split("\n")
            .map((d) => d.trim())
            .filter((d) => d),
        },
      };

      const response = await api.post("/bounties", bountyData);
      alert("Bounty created successfully!");
      navigate(`/bounties/${response.data.bounty._id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create bounty");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="create-bounty-page">
      <div className="create-bounty-container">
        <h1>Create New Bounty</h1>
        <p className="subtitle">
          Set up a new bug bounty program for your organization
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="bounty-form">
          <div className="form-group">
            <label htmlFor="title">Bounty Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              minLength={5}
              maxLength={200}
              placeholder="e.g., Web Application Security Testing"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              minLength={20}
              maxLength={5000}
              rows={8}
              placeholder="Describe what you're looking for, what types of vulnerabilities are in scope, and any specific requirements..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rewardMin">Minimum Reward ($) *</label>
              <input
                type="number"
                id="rewardMin"
                name="rewardMin"
                value={formData.rewardMin}
                onChange={handleChange}
                required
                min="0"
                step="1"
                placeholder="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rewardMax">Maximum Reward ($) *</label>
              <input
                type="number"
                id="rewardMax"
                name="rewardMax"
                value={formData.rewardMax}
                onChange={handleChange}
                required
                min="0"
                step="1"
                placeholder="5000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="severity">Severity Level *</label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="domains">In-Scope Domains</label>
            <textarea
              id="domains"
              name="domains"
              value={formData.domains}
              onChange={handleChange}
              rows={4}
              placeholder="Enter one domain per line, e.g.:&#10;example.com&#10;*.example.com&#10;api.example.com"
            />
            <small>Enter one domain per line</small>
          </div>

          <div className="form-group">
            <label htmlFor="excludedDomains">Out-of-Scope Domains</label>
            <textarea
              id="excludedDomains"
              name="excludedDomains"
              value={formData.excludedDomains}
              onChange={handleChange}
              rows={4}
              placeholder="Enter domains that should not be tested, one per line"
            />
            <small>Enter one domain per line</small>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Bounty"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBounty;
