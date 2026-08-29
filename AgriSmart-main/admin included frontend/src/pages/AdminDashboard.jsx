import { useSelector } from "react-redux";
import {
  FaUsers,
  FaTractor,
  FaSeedling,
  FaUserClock,
  FaCheckCircle,
  FaFileAlt,
} from "react-icons/fa";

import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import StatCard from "../components/StatCard";

function AdminDashboard() {
  const schemes = useSelector(
    (state) => state.schemes.schemes
  );

  const officers = useSelector(
    (state) => state.officers.officers
  );

  const pendingOfficers = officers.filter(
    (officer) => officer.status === "Pending"
  );

  const verifiedOfficers = officers.filter(
    (officer) => officer.status === "Verified"
  );

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN SECTION */}
      <main className="admin-main">

        {/* TOP NAVBAR */}
        <AdminNavbar />

        <div className="admin-content">

          {/* HERO SECTION */}
          <section className="admin-hero">

            <div className="hero-content">

              <span className="hero-tag">
                AGRISMART ADMIN PORTAL
              </span>

              <h1>
                Welcome Back, Admin 👋
              </h1>

              <p>
                Manage agricultural schemes, verify officers,
                and monitor the AgriSmart ecosystem from
                one intelligent dashboard.
              </p>

              <button
                className="hero-button"
              >
                View Schemes
              </button>

            </div>

            <div className="hero-image"></div>

          </section>


          {/* STATISTICS */}
          <section className="stats-grid">

            <StatCard
              title="Total Farmers"
              value="1,248"
              icon={<FaUsers />}
            />

            <StatCard
              title="Total Farms"
              value="856"
              icon={<FaTractor />}
            />

            <StatCard
              title="Active Schemes"
              value={schemes.length}
              icon={<FaSeedling />}
            />

            <StatCard
              title="Pending Officers"
              value={pendingOfficers.length}
              icon={<FaUserClock />}
            />

            <StatCard
              title="Verified Officers"
              value={verifiedOfficers.length}
              icon={<FaCheckCircle />}
            />

            <StatCard
              title="Total Documents"
              value="342"
              icon={<FaFileAlt />}
            />

          </section>


          {/* BOTTOM DASHBOARD */}
          <section className="dashboard-bottom">

            {/* RECENT SCHEMES */}
            <div className="dashboard-panel">

              <div className="panel-header">

                <div>
                  <h2>
                    Recent Scheme Activity
                  </h2>

                  <p>
                    Latest agricultural schemes
                    added to the platform.
                  </p>
                </div>

              </div>


              {schemes.slice(0, 4).map((scheme) => (

                <div
                  className="activity-item"
                  key={scheme.id}
                >

                  <div className="activity-icon">
                    <FaSeedling />
                  </div>


                  <div className="activity-info">

                    <h4>
                      {scheme.title}
                    </h4>

                    <p>
                      {scheme.category}
                    </p>

                  </div>


                  <span className="status-active">
                    {scheme.status}
                  </span>

                </div>

              ))}

            </div>


            {/* OFFICER REQUESTS */}
            <div className="dashboard-panel">

              <h2>
                Officer Requests
              </h2>

              <p className="panel-subtitle">
                Officers waiting for verification
              </p>


              {pendingOfficers.length > 0 ? (

                pendingOfficers.map((officer) => (

                  <div
                    className="officer-mini"
                    key={officer.id}
                  >

                    <div className="officer-avatar">

                      {officer.name.charAt(0)}

                    </div>


                    <div className="officer-info">

                      <h4>
                        {officer.name}
                      </h4>

                      <p>
                        {officer.district}
                      </p>

                    </div>


                    <span className="pending-status">
                      Pending
                    </span>

                  </div>

                ))

              ) : (

                <p className="no-data">
                  No pending officer requests.
                </p>

              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;
