import type { Account } from "../types.ts";
import { Button } from "@mui/material";
import React from "react";

const UserBlock: React.FC<{
  user: { user: Account; pressed: boolean };
  changePress: (id: number) => void;
}> = ({ user, changePress }) => {
  return (
    <Button
      variant="contained"
      size="large"
      onClick={() => changePress(user.user.id!)}
      color={user.pressed ? "success" : "primary"}
      disabled={user.user.closed}
    >
      {`${user.user.username}`}
      <span>{`${(user.user.balance! / 100).toFixed(2)}`}</span>
    </Button>
  );
};

const MemoizedUserBlock = React.memo(UserBlock, (prevProps, nextProps) => {
  return (
    prevProps.user.pressed === nextProps.user.pressed &&
    prevProps.user.user.balance === nextProps.user.user.balance &&
    prevProps.user.user.closed === nextProps.user.user.closed
  );
});
//export default UserBlock;
export default MemoizedUserBlock;
