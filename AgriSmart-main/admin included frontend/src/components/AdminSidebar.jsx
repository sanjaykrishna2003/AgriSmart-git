import { NavLink, useNavigate } from "react-router-dom";

import {
  FaLeaf,
  FaThLarge,
  FaSeedling,
  FaUserShield,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <aside className="agrismart-admin-sidebar">

      <div className="agrismart-admin-sidebar-content">

        {/* LOGO */}
        <div className="agrismart-admin-logo">

          <div className="agrismart-admin-logo-icon">
            <FaLeaf />
          </div>

          <h2>AgriSmart</h2>

          <p>Admin Portal</p>

        </div>


        {/* NAVIGATION */}
        <nav className="agrismart-admin-navigation">

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive
                ? "agrismart-admin-nav-item active"
                : "agrismart-admin-nav-item"
            }
          >
            <FaThLarge />

            <span>Dashboard</span>
          </NavLink>


          <NavLink
            to="/admin/schemes"
            className={({ isActive }) =>
              isActive
                ? "agrismart-admin-nav-item active"
                : "agrismart-admin-nav-item"
            }
          >
            <FaSeedling />

            <span>Manage Schemes</span>
          </NavLink>


          <NavLink
            to="/admin/officers"
            className={({ isActive }) =>
              isActive
                ? "agrismart-admin-nav-item active"
                : "agrismart-admin-nav-item"
            }
          >
            <FaUserShield />

            <span>Officer Verification</span>
          </NavLink>


          <NavLink
            to="/admin/profile"
            className={({ isActive }) =>
              isActive
                ? "agrismart-admin-nav-item active"
                : "agrismart-admin-nav-item"
            }
          >
            <FaUserCircle />

            <span>Profile</span>
          </NavLink>

        </nav>


        {/* LOGOUT */}
        <button
          className="agrismart-admin-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />

          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default AdminSidebar;