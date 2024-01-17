import { Account } from "../types.ts";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const UserBlock: React.FC<{ user: Account }> = ({ user }) => {
  const navigate = useNavigate();
  const redirect = () => {
    navigate("/piikki/name" + user.username);
  };
  return (
    <Button variant="contained" onClick={redirect}>
      {user.username}
    </Button>
  );
};

export default UserBlock;
