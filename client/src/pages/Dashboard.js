"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import "./Dashboard.css"

const Dashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState({
    bounties: [],
    submissions: [],
    stats: {},
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      if (user.role === "company") {
        const [bountiesRes, submissionsRes] = await Promise.all([
          api.get("/bounties/company/mine"),
          api.get("/submissions/company/received"),
        ])

        setData({
          bounties: bountiesRes.data.bounties,
          submissions: submissionsRes.data.submissions,
          stats: {
            totalBounties: bountiesRes.data.bounties.length,
            activeBounties: bountiesRes.data.bounties.filter((b) => b.status === "active").length,
            totalSubmissions: submissionsRes.data.submissions.length,
            pendingSubmissions: submissionsRes.data.submissions.filter((s) => s.status === "pending").length,
          },
        })
      } else if (user.role === "researcher") {
        const [submissionsRes, earningsRes] = await Promise.all([
          api.get("/submissions/researcher/mine"),
          api.get("/payments/earnings"),
        ])

        setData({
          submissions: submissionsRes.data.submissions,
          stats: {
            totalSubmissions: submissionsRes.data.submissions.length,
            acceptedSubmissions: submissionsRes.data.submissions.filter((s) => s.status === "accepted").length,
            totalEarnings: earningsRes.data.totalEarnings || 0,
            reputation: user.reputation || 0,
          },
        })
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.username}!</h1>
        <p>Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
      </div>

      <div className="dashboard-stats">
        {user.role === "company" && (
          <>
            <div className="stat-card">
              <h3>{data.stats.totalBounties}</h3>
              <p>Total Bounties</p>
            </div>
            <div className="stat-card">
              <h3>{data.stats.activeBounties}</h3>
              <p>Active Bounties</p>
            </div>
            <div className="stat-card">
              <h3>{data.stats.totalSubmissions}</h3>
              <p>Total Submissions</p>
            </div>
            <div className="stat-card">
              <h3>{data.stats.pendingSubmissions}</h3>
              <p>Pending Review</p>
            </div>
          </>
        )}

        {user.role === "researcher" && (
          <>
            <div className="stat-card">
              <h3>{data.stats.totalSubmissions}</h3>
              <p>Total Submissions</p>
            </div>
            <div className="stat-card">
              <h3>{data.stats.acceptedSubmissions}</h3>
              <p>Accepted</p>
            </div>
            <div className="stat-card">
              <h3>${data.stats.totalEarnings}</h3>
              <p>Total Earnings</p>
            </div>
            <div className="stat-card">
              <h3>{data.stats.reputation}</h3>
              <p>Reputation</p>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-content">
        {user.role === "company" && (
          <>
            <section className="dashboard-section">
              <div className="section-header">
                <h2>Your Bounties</h2>
                <Link to="/create-bounty" className="btn btn-primary">
                  Create New Bounty
                </Link>
              </div>

              <div className="items-list">
                {data.bounties.length > 0 ? (
                  data.bounties.map((bounty) => (
                    <div key={bounty._id} className="item-card">
                      <h3>{bounty.title}</h3>
                      <p>{bounty.description.substring(0, 100)}...</p>
                      <div className="item-meta">
                        <span className={`status ${bounty.status}`}>{bounty.status.toUpperCase()}</span>
                        <span className="reward">
                          ${bounty.reward.min} - ${bounty.reward.max}
                        </span>
                        <span className="submissions">{bounty.submissionCount} submissions</span>
                      </div>
                      <Link to={`/bounties/${bounty._id}`} className="btn btn-outline">
                        View Details
                      </Link>
                    </div>
                  ))
                ) : (
                  <p>
                    No bounties created yet. <Link to="/create-bounty">Create your first bounty</Link>
                  </p>
                )}
              </div>
            </section>

            <section className="dashboard-section">
              <h2>Recent Submissions</h2>
              <div className="items-list">
                {data.submissions.slice(0, 5).map((submission) => (
                  <div key={submission._id} className="item-card">
                    <h3>{submission.title}</h3>
                    <p>Bounty: {submission.bounty.title}</p>
                    <div className="item-meta">
                      <span className={`status ${submission.status}`}>{submission.status.toUpperCase()}</span>
                      <span className={`severity ${submission.severity}`}>{submission.severity.toUpperCase()}</span>
                      <span className="researcher">by {submission.researcher.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {user.role === "researcher" && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Your Submissions</h2>
              <Link to="/bounties" className="btn btn-primary">
                Browse Bounties
              </Link>
            </div>

            <div className="items-list">
              {data.submissions.length > 0 ? (
                data.submissions.map((submission) => (
                  <div key={submission._id} className="item-card">
                    <h3>{submission.title}</h3>
                    <p>Bounty: {submission.bounty.title}</p>
                    <div className="item-meta">
                      <span className={`status ${submission.status}`}>{submission.status.toUpperCase()}</span>
                      <span className={`severity ${submission.severity}`}>{submission.severity.toUpperCase()}</span>
                      {submission.reward?.amount && <span className="reward">${submission.reward.amount}</span>}
                    </div>
                    <div className="submission-date">
                      Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p>
                  No submissions yet. <Link to="/bounties">Start hunting for bugs!</Link>
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default Dashboard
