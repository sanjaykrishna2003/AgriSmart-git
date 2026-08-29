import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  FaBars,
  FaUserCircle,
} from "react-icons/fa";

import SearchBar from "./SearchBar";

function AdminNavbar() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.agri.user);

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
            {user?.name || "Admin"}
          </h4>

          <span>
            {user?.role || "Administrator"}
          </span>

        </div>

      </div>

    </header>
  );
}

export default AdminNavbar;