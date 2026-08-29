import { useNavigate } from "react-router-dom";

import {
  FaBars,
  FaUserCircle,
} from "react-icons/fa";

import SearchBar from "./SearchBar";

function AdminNavbar() {
  const navigate = useNavigate();

  return (
    <header className="admin-navbar">

      {/* MENU ICON */}
      <button className="menu-button">
        <FaBars />
      </button>


      {/* SEARCH BAR */}
      <SearchBar />


      {/* PROFILE */}
      <div
        className="admin-profile-mini"
        onClick={() => navigate("/admin/profile")}
      >

        <FaUserCircle className="profile-avatar" />

        <div className="profile-info">

          <h4>
            Admin
          </h4>

          <span>
            Administrator
          </span>

        </div>

      </div>

    </header>
  );
}

export default AdminNavbar;