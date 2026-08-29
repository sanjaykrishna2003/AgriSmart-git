import { useDispatch, useSelector } from "react-redux";

import {
  approveOfficer,
  rejectOfficer,
} from "../services/officerSlice";

import {
  FaCheck,
  FaTimes,
  FaUserShield,
} from "react-icons/fa";

import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

function OfficerVerification() {
  const dispatch = useDispatch();

  const officers = useSelector(
    (state) => state.officers.officers
  );

  const pendingCount = officers.filter(
    (officer) => officer.status === "Pending"
  ).length;

  const verifiedCount = officers.filter(
    (officer) => officer.status === "Verified"
  ).length;

  return (
    <div className="admin-layout">

      <AdminSidebar />

      <main className="admin-main">

        <AdminNavbar />

        <div className="admin-content">

          {/* PAGE HEADING */}
          <div className="page-heading">

            <span className="page-tag">
              ADMIN VERIFICATION
            </span>

            <h1>
              Officer Verification
            </h1>

            <p>
              Review officer registration requests and
              verify authorized agriculture officers.
            </p>

          </div>


          {/* VERIFICATION SUMMARY */}
          <div className="verification-summary">

            <div className="verification-summary-card">

              <span>Pending Requests</span>

              <h2>{pendingCount}</h2>

            </div>


            <div className="verification-summary-card">

              <span>Verified Officers</span>

              <h2>{verifiedCount}</h2>

            </div>


            <div className="verification-summary-card">

              <span>Total Officers</span>

              <h2>{officers.length}</h2>

            </div>

          </div>


          {/* OFFICER LIST */}
          <div className="verification-list">

            {officers.map((officer) => (

              <div
                className="verification-card"
                key={officer.id}
              >

                {/* OFFICER DETAILS */}
                <div className="verification-profile">

                  <div className="large-avatar">
                    <FaUserShield />
                  </div>


                  <div className="verification-details">

                    <h2>
                      {officer.name}
                    </h2>

                    <p>
                      {officer.email}
                    </p>

                    <span className="officer-district">
                      {officer.district}
                    </span>

                  </div>

                </div>


                {/* STATUS AND ACTIONS */}
                <div className="verification-actions">

                  <span
                    className={`verification-status ${officer.status.toLowerCase()}`}
                  >
                    {officer.status}
                  </span>


                  {officer.status === "Pending" && (

                    <>
                      <button
                        className="approve-btn"
                        onClick={() =>
                          dispatch(
                            approveOfficer(officer.id)
                          )
                        }
                      >
                        <FaCheck />

                        Approve
                      </button>


                      <button
                        className="reject-btn"
                        onClick={() =>
                          dispatch(
                            rejectOfficer(officer.id)
                          )
                        }
                      >
                        <FaTimes />

                        Reject
                      </button>

                    </>

                  )}

                </div>

              </div>

            ))}

          </div>

        </div>

      </main>

    </div>
  );
}

export default OfficerVerification;
