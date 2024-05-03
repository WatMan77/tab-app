import type { Account } from "../../types";
import CurrencyInput from "react-currency-input-field";
import { Button } from "@mui/material";

const UpdateBalance: React.FC<{
  user: { account: Account; change: number };
  handleBalanceChange: (username: string, change: number) => void;
  changePiikkiStatus: (account: Account) => void;
}> = ({ user, handleBalanceChange, changePiikkiStatus }) => {
  return (
    <>
      <p>
        {user.account.username} {user.account.balance! / 100} €
      </p>
      <CurrencyInput
        placeholder="Enter a value"
        onValueChange={(_value, _name, values) => {
          handleBalanceChange(
            user.account.username,
            values!.float ? values!.float : 0
          );
        }}
        decimalSeparator=","
        groupSeparator=" "
      />

      <>
        {(user.account.balance! / 100).toFixed(2)} € + {user.change} € ={" "}
        {(user.account.balance! / 100 + user.change).toFixed(2)} €
      </>
      {user.account.closed ? (
        <Button
          variant="contained"
          color="error"
          onClick={() => changePiikkiStatus(user.account)}
        >
          Avaa piikki
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={() => changePiikkiStatus(user.account)}
        >
          Sulje piikki
        </Button>
      )}
    </>
  );
};

export default UpdateBalance;
