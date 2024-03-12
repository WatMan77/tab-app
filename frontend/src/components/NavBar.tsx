import AppBar from "@mui/material/AppBar";
import MenuItem from "@mui/material/MenuItem";
import { Toolbar } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  console.log("NavBar");
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
        <MenuItem key="logout" onClick={logout}>
          Logout
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
      <AppBar position="static">
        <Toolbar>
          {home}
          {adminData && adminPages}
          {adminOrLogout(adminData)}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default NavBar;
