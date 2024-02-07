import { Account } from "../../types";
import CurrencyInput from "react-currency-input-field";

const UpdateUser: React.FC<{
  user: { account: Account; change: number };
  handleBalanceChange: (id: number, change: number) => void;
}> = ({ user, handleBalanceChange }) => {
  return (
    <>
      <p>
        {user.account.username} {user.account.balance! / 100}
      </p>
      <CurrencyInput
        placeholder="Enter a value"
        onValueChange={(_value, _name, values) => {
          console.log("Values?", values);
          handleBalanceChange(
            user.account.id!,
            values!.float ? values!.float : 0
          );
        }}
        decimalSeparator=","
        groupSeparator=" "
      />

      <>
        {user.account.balance! / 100} + {user.change} ={" "}
        {user.account.balance! / 100 + user.change}
      </>
    </>
  );
};

export default UpdateUser;
