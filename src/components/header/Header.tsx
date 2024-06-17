import { Link } from "react-router-dom";
import styles from "./Header.module.scss";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { FileService } from "../../services/file-service";
import SearchBar from "../searchbar/SearchBar";

const Header = () => {
  const [menuActive, setMenuActive] = useState(false);
  const [userProfilePicture, setUserProfilePicture] = useState<string>(
    "/public/assets/default_user_pfp.jpg"
  );
  const { isLoggedIn } = useContext(AuthContext);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  let menuRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (isLoggedIn) {
      const getUserProfilePicture = async () => {
        const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (loggedUser && loggedUser.profilePicture) {
          try {
            const res = await FileService.getFile(loggedUser.profilePicture);
            setUserProfilePicture(res);
          } catch (e) {
            console.error(e);
          }
        }
      };
      getUserProfilePicture();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    let closeSideMenuOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        toggleMenu();
      }
    };
    if (menuActive) {
      document.addEventListener("mousedown", closeSideMenuOnOutsideClick);
    } else {
      document.removeEventListener("mousedown", closeSideMenuOnOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", closeSideMenuOnOutsideClick);
    };
  }, [menuActive]);

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <Link to="/">
          <picture>
            <source srcSet="/public/assets/stall_icon.webp" type="image/webp" />
            <img
              className={styles.homeIcon}
              src="/public/assets/stall_icon.jpg"
              alt="home icon"
            />
          </picture>
        </Link>
        <Link to="/about" className={styles.wideResMenuItem}>
          <p>About</p>
        </Link>
        <Link to="/groups" className={styles.wideResMenuItem}>
          <p>Explore Groups</p>
        </Link>
        <SearchBar/>
        {isLoggedIn ? (
          <Link to="/profile" className={styles.wideResMenuItem}>
            <img
              className={styles.profileIcon}
              src={userProfilePicture}
              alt="profile picture"
            />
          </Link>
        ) : (
          <div className={styles.ifNotLoggedWideRes}>
            <Link to="/login" className={styles.wideResMenuItem}>
              <p className={styles.linkIfNotLogged}>Login</p>
            </Link>
            <Link to="/register" className={styles.wideResMenuItem}>
              <p className={styles.linkIfNotLogged}>Register</p>
            </Link>
          </div>
        )}
        <button className={styles.menuBtn} onClick={toggleMenu}>
          <i className="bi bi-list"></i>
        </button>
      </nav>
      <nav
        className={`${styles.sideMenu} ${
          menuActive ? styles.sideMenuActive : ""
        }
        ${!isLoggedIn ? styles.sideMenuActiveNotLogged : ""}
        `}
        ref={menuRef}
      >
        {isLoggedIn ? (
          <div>
            <Link to="/profile" onClick={toggleMenu}>
              <img
                className={styles.profileIcon}
                src={userProfilePicture}
                alt="profile picture"
              />
            </Link>
          </div>
        ) : (
          <>
            <Link to="/login">
              <p onClick={toggleMenu}>Login</p>
            </Link>
            <Link to="/register">
              <p onClick={toggleMenu}>Register</p>
            </Link>
          </>
        )}
        <button className={styles.closeMenuBtn} onClick={toggleMenu}>
          <i className="bi bi-x-lg"></i>
        </button>
        <Link to="/groups" onClick={toggleMenu}>
          <p>Explore Groups</p>
        </Link>
        <Link to="/about" onClick={toggleMenu}>
          <p>About</p>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
