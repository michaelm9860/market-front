import { RouteObject } from "react-router-dom";
import BlockLoggedUsers from "../components/route-authorizers/BlockLoggedUsers";
import ProtectedRoute from "../components/route-authorizers/ProtectedRoute";
import Root from "../layout/Root";
import Group from "./group/GroupDetails";
import Groups from "./entitiesAll/Groups";
import Posts from "./entitiesAll/Posts";
import About from "./about/About";
import ErrorPage from "./error/ErrorPage";
import PageNotFoundError from "./error/PageNotFoundError";
import Login from "./login/Login";
import Profile from "./profile/Profile";
import Register from "./register/Register";
import ViewUser from "./profile/ViewUser";
import PostDetails from "./post/PostDetails";
import CreateNewPost from "./createNew/CreateNewPost";
import CreateNewGroup from "./createNew/CreateNewGroup";
import SearchResults from "./entitiesAll/SearchResults";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Posts />,
      },
      {
        path: "/posts",
        element: <Posts />,
      },
      {
        path: "/posts/:id",
        element: <PostDetails />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/login",
        element: (
          <BlockLoggedUsers>
            <Login />
          </BlockLoggedUsers>
        ),
      },
      {
        path: "/register",
        element: (
          <BlockLoggedUsers>
            <Register />
          </BlockLoggedUsers>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "users/:id",
        element: (
          <ProtectedRoute>
            <ViewUser />
          </ProtectedRoute>
        ),
      },
      {
        path: "/groups",
        element: <Groups />,
      },
      {
        path: "/groups/:id",
        element: (
          <ProtectedRoute>
            <Group />
          </ProtectedRoute>
        ),
      },
      {
        path: "/create-post",
        element: (
          <ProtectedRoute>
            <CreateNewPost />
          </ProtectedRoute>
        ),
      },
      {
        path: "/groups/:id/create-post",
        element: (
          <ProtectedRoute>
            <CreateNewPost />
          </ProtectedRoute>
        ),
      },
      {
        path: "/create-group",
        element: (
          <ProtectedRoute>
            <CreateNewGroup />
          </ProtectedRoute>
        ),
      },
      {
        path: "/search/:query",
        element: <SearchResults />,
      },
      {
        path: "*",
        element: <PageNotFoundError />,
      },
    ],
  },
];
