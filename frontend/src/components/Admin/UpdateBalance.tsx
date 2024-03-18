import { Account } from "../../types";
import CurrencyInput from "react-currency-input-field";

const UpdateBalance: React.FC<{
  user: { account: Account; change: number };
  handleBalanceChange: (username: string, change: number) => void;
}> = ({ user, handleBalanceChange }) => {
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
    </>
  );
};

export default UpdateBalance;
