import { Account } from "../types.ts";
import { Button } from "@mui/material";

const UserBlock: React.FC<{
  user: Account;
  changePress: (username: string) => void;
}> = ({ user, changePress }) => {
  return (
    <Button variant="contained" onClick={() => changePress(user.username)}>
      {user.username}
    </Button>
  );
};

export default UserBlock;
