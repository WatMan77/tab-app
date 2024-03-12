import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import DrinkContainer from "./components/DrinkContainer.tsx";
import AdminLogin from "./components/Admin/Admin.tsx";
import NavBar from "./components/NavBar.tsx";
import BalanceAdmin from "./components/Admin/BalanceAdmin.tsx";
import ProductAdmin from "./components/Admin/ProductAdmin.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <NavBar />
        <App />
      </>
    ),
  },
  {
    path: "/piikki",
    element: (
      <>
        <NavBar />
        <DrinkContainer />
      </>
    ),
  },
  {
    path: "/adminlogin",
    element: (
      <>
        <NavBar />
        <AdminLogin />
      </>
    ),
  },
  {
    path: "/balances",
    element: (
      <>
        <NavBar />
        <BalanceAdmin />
      </>
    ),
  },
  {
    path: "/products",
    element: (
      <>
        <NavBar />
        <ProductAdmin />
      </>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </React.StrictMode>
);
