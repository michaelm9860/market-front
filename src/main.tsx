import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { routes } from "./routes/index.tsx";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AuthContextProvider } from "./contexts/AuthContext.tsx";
import LoadingWrapper from "./components/route-authorizers/LoadingWrapper.tsx";

const router = createBrowserRouter(routes);

const div = document.getElementById("root")!;

ReactDOM.createRoot(div).render(
  <AuthContextProvider>
    <LoadingWrapper>
      <RouterProvider router={router} />
    </LoadingWrapper>
  </AuthContextProvider>
);
