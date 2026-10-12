import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import { Toolbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styling/navbar.scss";
import crown from "../assets/crown_white.svg";
import LogoutIcon from "@mui/icons-material/Logout";

const NavBar = () => {
  const navigate = useNavigate();

  const adminData = window.localStorage.getItem("loggedPiikkiAdmin");

  const logout = () => {
    window.localStorage.removeItem("loggedPiikkiAdmin");
    window.location.href = "/"
  };

  const adminOrLogout = (logged: string | null) => {
    if (logged) {
      return (
        <Button className="nav-item admin" key="logout" onClick={logout}>
          <LogoutIcon sx={{ marginRight: "10px" }} /> Logout
        </Button>
      );
    } else {
      return (
        <Button
          className="nav-item"
          key="login"
          onClick={() => navigate("/adminlogin")}
        >
          Login
        </Button>
      );
    }
  };

  const home = (
    <>
      <Button className="nav-item" key="home" onClick={() => navigate("/")}>
        Koti
      </Button>
      <Button
        className="nav-item"
        key="transactions"
        onClick={() => navigate("/transactions")}
      >
        Tapahtumat
      </Button>
      <Button
        className="nav-item"
        key="changes"
        onClick={() => navigate("/changes")}
      >
        Muutokset
      </Button>
      <Button
        className="nav-item"
        key="pricelist"
        onClick={() => navigate("/pricelist")}
      >
        Viivat
      </Button>
    </>
  );

  const adminPages = (
    <>
      <Button
        className="nav-item"
        key="balances"
        onClick={() => navigate("/balances")}
      >
        Balances
      </Button>
      <Button
        className="nav-item"
        key="products"
        onClick={() => navigate("/products")}
      >
        Products
      </Button>
    </>
  );

  return (
    <div>
      <AppBar component="nav">
        <Toolbar>
          <img className="crown" src={crown} alt="" />
          {home}
          {adminData && adminPages}
          {adminOrLogout(adminData)}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default NavBar;
