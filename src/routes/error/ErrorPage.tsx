import {
  useLocation,
  useNavigate,
  useRouteError
} from "react-router-dom";
import styles from "./Error.module.scss";

const ErrorPage: React.FC = () => {
  const error = useRouteError();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className={styles.error}>
      <h1>Something went wrong</h1>
      <p>
        {error instanceof Error
          ? error.message
          : "An unexpected error occurred"}
      </p>
      <p>Location: {location.pathname}</p>
      <button onClick={() => navigate("/")}>Go to Home</button>

      <button onClick={() => navigate(-1)}>Go back</button>
    </div>
  );
};

export default ErrorPage;
