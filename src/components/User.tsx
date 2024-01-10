import { User } from "../types.ts";
import { Button } from "@mui/material";

const UserBlock: React.FC<{ user: User }> = ({ user }) => {
  return <Button variant="contained">{user.name}</Button>;
};

export default UserBlock;
