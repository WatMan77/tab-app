import { useState } from "react";
import type { Account } from "../../types";
import CurrencyInput from "react-currency-input-field";
import {
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const UpdateBalance: React.FC<{
  user: { account: Account; change: number };
  handleBalanceChange: (username: string, change: number) => void;
  changePiikkiStatus: (account: Account) => void;
  handleNameChange: (username: string, newName: string) => void;
  handleDelete: (id: number) => void;
}> = ({
  user,
  handleBalanceChange,
  changePiikkiStatus,
  handleNameChange,
  handleDelete,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
            <Button variant="contained" color="error" onClick={handleOpen}>
              Delete user
            </Button>
            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {"Poistatko käyttäjän?"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Haluatko varmasti poistaa käyttäjän {user.account.username}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button variant="contained" color="error" onClick={handleClose}>
                  EI
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleDelete(user.account.id!)}
                >
                  KYLLÄ
                </Button>
              </DialogActions>
            </Dialog>
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
