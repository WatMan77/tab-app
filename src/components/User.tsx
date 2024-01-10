import { User } from "../types.ts";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const UserBlock: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const redirect = () => {
    navigate("/piikki/name" + user.name);
  };
  return (
    <Button variant="contained" onClick={redirect}>
      {user.name}
    </Button>
  );
};

export default UserBlock;
