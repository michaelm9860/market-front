import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { FC } from "../../@types/FC";
import { AuthContext } from "../../contexts/AuthContext";

const ProtectedRoute: FC = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);

  if (!isLoggedIn) {
    return <Navigate to={"/login"} replace/>;
  }
  else {
    return children;
  }
};

export default ProtectedRoute;
