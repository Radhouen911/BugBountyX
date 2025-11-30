"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import "./Home.css"

const Home = () => {
  const [stats, setStats] = useState({
    totalBounties: 0,
    activeBounties: 0,
    totalRewards: 0,
  })
  const [recentBounties, setRecentBounties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      const [bountiesResponse] = await Promise.all([api.get("/bounties?limit=6")])

      setRecentBounties(bountiesResponse.data.bounties)

      // Calculate stats from bounties
      const activeBounties = bountiesResponse.data.bounties.filter((b) => b.status === "active")
      const totalRewards = activeBounties.reduce((sum, bounty) => sum + bounty.reward.max, 0)

      setStats({
        totalBounties: bountiesResponse.data.pagination?.total || 0,
        activeBounties: activeBounties.length,
        totalRewards,
      })
    } catch (error) {
      console.error("Failed to fetch home data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to BugBountyX</h1>
          <p>
            Connect security researchers with companies to find and fix vulnerabilities. Earn rewards for responsible
            disclosure of security issues.
          </p>
          <div className="hero-actions">
            <Link to="/bounties" className="btn btn-primary">
              Browse Bounties
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stats-container">
          <div className="stat-item">
            <h3>{stats.totalBounties}</h3>
            <p>Total Bounties</p>
          </div>
          <div className="stat-item">
            <h3>{stats.activeBounties}</h3>
            <p>Active Bounties</p>
          </div>
          <div className="stat-item">
            <h3>${stats.totalRewards.toLocaleString()}</h3>
            <p>Total Rewards</p>
          </div>
        </div>
      </section>

      <section className="recent-bounties">
        <div className="section-container">
          <h2>Recent Bounties</h2>
          <div className="bounties-grid">
            {recentBounties.map((bounty) => (
              <div key={bounty._id} className="bounty-card">
                <h3>{bounty.title}</h3>
                <p className="bounty-description">{bounty.description.substring(0, 150)}...</p>
                <div className="bounty-meta">
                  <span className={`severity ${bounty.severity}`}>{bounty.severity.toUpperCase()}</span>
                  <span className="reward">
                    ${bounty.reward.min} - ${bounty.reward.max}
                  </span>
                </div>
                <Link to={`/bounties/${bounty._id}`} className="btn btn-outline">
                  View Details
                </Link>
              </div>
            ))}
          </div>
          <div className="section-footer">
            <Link to="/bounties" className="btn btn-primary">
              View All Bounties
            </Link>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Browse Bounties</h3>
              <p>Find security bounties that match your skills and interests.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Find Vulnerabilities</h3>
              <p>Test applications and systems to discover security issues.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Submit Reports</h3>
              <p>Submit detailed vulnerability reports with proof of concept.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Get Rewarded</h3>
              <p>Receive monetary rewards for valid security findings.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
