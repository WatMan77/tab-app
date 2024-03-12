import AppBar from "@mui/material/AppBar";
import MenuItem from "@mui/material/MenuItem";
import { Toolbar } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  console.log("NavBar");
  const navigate = useNavigate();

  const adminData = window.localStorage.getItem("loggedPiikkiAdmin");

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
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default NavBar;
