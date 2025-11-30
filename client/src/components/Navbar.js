"use client"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import "./Navbar.css"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          BugBountyX
        </Link>

        <div className="nav-menu">
          <Link to="/bounties" className="nav-link">
            Bounties
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>

              {user.role === "company" && (
                <Link to="/create-bounty" className="nav-link">
                  Create Bounty
                </Link>
              )}

              {user.role === "admin" && (
                <Link to="/admin" className="nav-link">
                  Admin
                </Link>
              )}

              <div className="nav-user">
                <span className="user-info">
                  {user.username} ({user.role})
                </span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link register-link">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
