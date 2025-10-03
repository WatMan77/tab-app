import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.scss";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import AdminLogin from "./components/Admin/Admin.tsx";
import NavBar from "./components/NavBar.tsx";
import BalanceAdmin from "./components/Admin/BalanceAdmin.tsx";
import ProductAdmin from "./components/Admin/ProductAdmin.tsx";
import Transactions from "./components/Transactions.tsx";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PriceList from "./components/PricesList.tsx";
import Changes from "./components/Changes.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    path: "/transactions",
    element: (
      <>
        <NavBar />
        <Transactions />
      </>
    ),
  },
  {
    path: "/pricelist",
    element: (
      <>
        <NavBar />
        <PriceList />
      </>
    ),
  },
  {
    path: "/changes",
    element: (
      <>
        <NavBar />
        <Changes />
      </>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: ["Montserrat", "Roboto"].join(","),
    button: {
      fontWeight: 600,
    },
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // <--- important for dark themes
      />
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <RouterProvider router={router}></RouterProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);