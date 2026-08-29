import { FaSearch } from "react-icons/fa";

function SearchBar() {
  return (
    <div className="admin-search">

      <FaSearch className="search-icon" />

      <input
        type="text"
        placeholder="Search schemes, officers..."
      />

    </div>
  );
}

export default SearchBar;