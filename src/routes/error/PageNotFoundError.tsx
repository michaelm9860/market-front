import { useNavigate } from "react-router-dom";
import styles from "./Error.module.scss";

const PageNotFoundError = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.error}>
      <h1>404 Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <p>
        <i>Please check the URL and try again.</i>
      </p>
      <button onClick={() => navigate("/")}>Go to Home</button>

      <button onClick={() => navigate(-1)}>Go back</button>
    </div>
  );
};

export default PageNotFoundError;
