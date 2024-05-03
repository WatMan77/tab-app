import type { Account } from "../types.ts";
import { Button } from "@mui/material";

const UserBlock: React.FC<{
  user: { user: Account; pressed: boolean };
  changePress: (username: string) => void;
}> = ({ user, changePress }) => {
  return (
    <Button
      variant="contained"
      size="large"
      onClick={() => changePress(user.user.username)}
      color={user.pressed ? "success" : "primary"}
      disabled={user.user.closed}
    >
      {`${user.user.username} ${(user.user.balance! / 100).toFixed(2)}€`}
    </Button>
  );
};

export default UserBlock;
