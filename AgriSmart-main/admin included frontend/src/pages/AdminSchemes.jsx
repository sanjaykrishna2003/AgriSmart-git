import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addScheme,
  deleteScheme,
} from "../services/schemeSlice";

import {
  FaPlus,
  FaTrash,
  FaSeedling,
} from "react-icons/fa";

import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

function AdminSchemes() {
  const dispatch = useDispatch();

  const schemes = useSelector(
    (state) => state.schemes.schemes
  );

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.category ||
      !formData.description
    ) {
      alert("Please fill all fields");
      return;
    }

    dispatch(
      addScheme({
        title: formData.title,
        category: formData.category,
        description: formData.description,
      })
    );

    setFormData({
      title: "",
      category: "",
      description: "",
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteScheme(id));
  };

  return (
    <div className="admin-layout">

      <AdminSidebar />

      <main className="admin-main">

        <AdminNavbar />

        <div className="admin-content">

          {/* PAGE HEADING */}
          <div className="page-heading">

            <span className="page-tag">
              AGRICULTURAL SUPPORT
            </span>

            <h1>Manage Schemes</h1>

            <p>
              Create and manage agricultural schemes
              available for farmers.
            </p>

          </div>


          <div className="scheme-layout">

            {/* ADD SCHEME FORM */}
            <div className="add-scheme-card">

              <div className="form-heading">

                <div className="form-icon">
                  <FaPlus />
                </div>

                <div>
                  <h2>Add New Scheme</h2>

                  <p>
                    Enter the scheme details below.
                  </p>
                </div>

              </div>


              <form onSubmit={handleSubmit}>

                {/* SCHEME TITLE */}
                <div className="form-group">

                  <label>
                    Scheme Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter scheme name"
                  />

                </div>


                {/* CATEGORY */}
                <div className="form-group">

                  <label>
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Category
                    </option>

                    <option value="Financial Support">
                      Financial Support
                    </option>

                    <option value="Crop Insurance">
                      Crop Insurance
                    </option>

                    <option value="Irrigation">
                      Irrigation
                    </option>

                    <option value="Equipment">
                      Equipment Support
                    </option>

                    <option value="Seeds and Fertilizers">
                      Seeds and Fertilizers
                    </option>

                  </select>

                </div>


                {/* DESCRIPTION */}
                <div className="form-group">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the scheme..."
                  />

                </div>


                <button
                  type="submit"
                  className="add-scheme-btn"
                >
                  <FaPlus />

                  Add Scheme
                </button>

              </form>

            </div>


            {/* SCHEMES LIST */}
            <div className="schemes-list-card">

              <div className="list-header">

                <div>

                  <h2>
                    Available Schemes
                  </h2>

                  <p>
                    {schemes.length} schemes available
                  </p>

                </div>

              </div>


              <div className="scheme-list">

                {schemes.length > 0 ? (

                  schemes.map((scheme) => (

                    <div
                      className="scheme-item"
                      key={scheme.id}
                    >

                      <div className="scheme-icon">
                        <FaSeedling />
                      </div>


                      <div className="scheme-info">

                        <h3>
                          {scheme.title}
                        </h3>

                        <span>
                          {scheme.category}
                        </span>

                        <p>
                          {scheme.description}
                        </p>

                      </div>


                      <div className="scheme-actions">

                        <span className="status-active">
                          {scheme.status}
                        </span>

                        <button
                          className="delete-scheme-btn"
                          onClick={() =>
                            handleDelete(scheme.id)
                          }
                        >
                          <FaTrash />
                        </button>

                      </div>

                    </div>

                  ))

                ) : (

                  <div className="no-schemes">

                    <FaSeedling />

                    <h3>
                      No Schemes Available
                    </h3>

                    <p>
                      Add your first agricultural scheme
                      using the form.
                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminSchemes;
