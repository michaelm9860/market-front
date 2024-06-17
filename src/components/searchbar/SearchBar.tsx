import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SearchBar.module.scss";

const SearchBar = () => {
  const [query, setQuery] = useState<string>("");

  const navigate = useNavigate();

  const search = () => {
    navigate(`/search/${query}`);
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Search..."
        className={styles.searchInput}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={search}>
        <i className="bi bi-search"></i>
      </button>
    </div>
  );
};

export default SearchBar;
