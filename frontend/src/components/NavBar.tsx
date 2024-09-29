import AppBar from "@mui/material/AppBar";
import MenuItem from "@mui/material/MenuItem";
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
    navigate("/"); // Needed to refresh the page
  };

  const adminOrLogout = (logged: string | null) => {
    if (logged) {
      // return <Button onClick={logout}>Logout</Button>;
      return (
        <MenuItem className="admin" key="logout" onClick={logout}>
          <LogoutIcon sx={{ marginRight: "10px" }} /> Logout
        </MenuItem>
      );
    } else {
      return (
        <MenuItem key="login" onClick={() => navigate("/adminlogin")}>
          Login
        </MenuItem>
      );
    }
  };

  const home = (
    <>
      <MenuItem key="home" onClick={() => navigate("/")}>
        Home
      </MenuItem>
      <MenuItem key="transactions" onClick={() => navigate("/transactions")}>
        Transactions
      </MenuItem>
      <MenuItem key="pricelist" onClick={() => navigate("/pricelist")}>
        Hinnasto
      </MenuItem>
    </>
  );

  const adminPages = (
    <>
      <MenuItem key="balances" onClick={() => navigate("/balances")}>
        Balances
      </MenuItem>
      <MenuItem key="products" onClick={() => navigate("/products")}>
        Products
      </MenuItem>
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
