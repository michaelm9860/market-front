import { useContext } from "react";
import { FC } from "../../@types/FC";
import { AuthContext } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const BlockLoggedUsers: FC = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);
  if (isLoggedIn) {
    return <Navigate to={"/"} replace/>;
  }
  else {
    return children;
  }
};

export default BlockLoggedUsers;
