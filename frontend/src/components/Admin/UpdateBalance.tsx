import type { Account } from "../../types";
import CurrencyInput from "react-currency-input-field";
import {
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const UpdateBalance: React.FC<{
  user: { account: Account; change: number };
  handleBalanceChange: (username: string, change: number) => void;
  changePiikkiStatus: (account: Account) => void;
  handleNameChange: (username: string, newName: string) => void;
}> = ({ user, handleBalanceChange, changePiikkiStatus, handleNameChange }) => {
  return (
    <div className={"account " + (user.account.closed ? "closed" : "")}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
          className="summary"
        >
          <h3>
            {user.account.username} {user.account.balance! / 100} €
          </h3>
        </AccordionSummary>
        <AccordionDetails>
          <div className="row">
            <TextField
              placeholder="Change username"
              onChange={({ target }) =>
                handleNameChange(user.account.username, target.value)
              }
            />
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
                color="secondary"
                onClick={() => changePiikkiStatus(user.account)}
              >
                Sulje piikki
              </Button>
            )}
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default UpdateBalance;
