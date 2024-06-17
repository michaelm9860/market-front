import { useContext } from "react";
import { FC } from "../../@types/FC"
import { AuthContext } from "../../contexts/AuthContext";
import LoadingSpinner from "../LoadingSpinner";

const LoadingWrapper:FC = ({ children }) => {
    const { loading } = useContext(AuthContext);
    if (loading) {
        return <LoadingSpinner/>
    }

  return children;
}

export default LoadingWrapper