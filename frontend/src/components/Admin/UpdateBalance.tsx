import React, { useState } from "react";
import { UserType, type Account } from "../../types";
import CurrencyInput from "react-currency-input-field";
import {
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  TextField,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  FormControl,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const UpdateBalance: React.FC<{
  user: { account: Account; change: number };
  handleBalanceChange: (id: number, change: number) => void;
  changePiikkiStatus: (account: Account) => void;
  handleNameChange: (id: number, newName: string) => void;
  handleDelete: (id: number) => void;
  handleCategoryChange: (id: number, category: UserType) => void;
  handlePinChange: (id: number, newPin: string) => void;
}> = React.memo(
  ({
    user,
    handleBalanceChange,
    changePiikkiStatus,
    handleNameChange,
    handleDelete,
    handleCategoryChange,
    handlePinChange,
  }) => {
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState<UserType>(user.account.category);

    const handleOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    const categories = [
      <MenuItem key={UserType.ASUKAS} value={UserType.ASUKAS}>
        {UserType.ASUKAS}
      </MenuItem>,
      <MenuItem key={UserType.VANHA} value={UserType.VANHA}>
        {UserType.VANHA}
      </MenuItem>,
      <MenuItem key={UserType.HANGAROUND} value={UserType.HANGAROUND}>
        {UserType.HANGAROUND}
      </MenuItem>,
    ];

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
              {user.account.username} {user.account.balance! / 100}
            </h3>
          </AccordionSummary>
          <AccordionDetails>
            <div className="row">
              <TextField
                placeholder="Name"
                onChange={({ target }) =>
                  handleNameChange(user.account.id!, target.value)
                }
              />

              <FormControl
                variant="outlined"
                sx={{ m: 1, minWidth: 120, flexGrow: 1 }}
              >
                <Select
                  value={category} // Controlled value
                  onChange={(event) => {
                    handleCategoryChange(
                      user.account.id!,
                      event.target.value as UserType
                    );
                    setCategory(event.target.value as UserType);
                  }}
                >
                  <MenuItem value="" disabled>
                    Select a category
                  </MenuItem>
                  {categories}
                </Select>
              </FormControl>
              <TextField
                placeholder="Pin"
                onChange={({ target }) =>
                  handlePinChange(user.account.id!, target.value)
                }
              />
              <CurrencyInput
                placeholder="Amount"
                onValueChange={(_value, _name, values) => {
                  handleBalanceChange(
                    user.account.id!,
                    values!.float ? values!.float : 0
                  );
                }}
                decimalSeparator=","
                groupSeparator=" "
              />

              <>
                {(user.account.balance! / 100).toFixed(2)} + {user.change} ={" "}
                {(user.account.balance! / 100 + user.change).toFixed(2)}
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
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleClose}
                  >
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
  }
);

// export default UpdateBalance;
const MemoizedUpdateBalance = React.memo(
  UpdateBalance,
  (prevProps, nextProps) => {
    return (
      prevProps.user.account.balance === nextProps.user.account.balance &&
      prevProps.user.account.username === nextProps.user.account.username &&
      prevProps.user.account.closed === nextProps.user.account.closed &&
      prevProps.user.change === nextProps.user.change &&
      prevProps.user.account.category === nextProps.user.account.category
    );
  }
);

export default MemoizedUpdateBalance;
