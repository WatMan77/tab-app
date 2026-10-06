import React, { memo, useId, useState } from "react";
import { type Account } from "@app/common";
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

// The pending, unsaved edits for one account. The row is fully controlled from this,
// because a virtualized row unmounts when it scrolls out of view and anything kept in
// the DOM or in local state would silently vanish while still being sent on confirm.
export type Draft = {
  change: number; // euros, 0 means unchanged
  changeInput: string; // the raw text CurrencyInput is showing
  newName: string; // "" means unchanged
  pincode: string; // "" means unchanged
};

// Every untouched row shares this reference, so a memoized row never re-renders
// because of a draft it does not own.
export const EMPTY_DRAFT: Draft = {
  change: 0,
  changeInput: "",
  newName: "",
  pincode: "",
};

const UpdateBalance: React.FC<{
  account: Account;
  draft: Draft;
  expanded: boolean;
  onToggleExpanded: (id: number, expanded: boolean) => void;
  updateDraft: (id: number, patch: Partial<Draft>) => void;
  changePiikkiStatus: (account: Account) => void;
  handleDelete: (id: number) => void;
}> = ({
  account,
  draft,
  expanded,
  onToggleExpanded,
  updateDraft,
  changePiikkiStatus,
  handleDelete,
}) => {
  const [open, setOpen] = useState(false);
  const id = useId();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className={"account " + (account.closed ? "closed" : "")}>
      <Accordion
        disableGutters
        expanded={expanded}
        onChange={(_event, isExpanded) => onToggleExpanded(account.id!, isExpanded)}
        // Collapsed rows render nothing, and skipping the animation keeps the
        // virtualizer from re-measuring on every frame of the transition.
        TransitionProps={{ unmountOnExit: true, timeout: 0 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${id}-content`}
          id={`${id}-header`}
          className="summary"
        >
          <h3>
            {account.username} {account.balance! / 100}
          </h3>
        </AccordionSummary>
        <AccordionDetails>
          <div className="account-editor">
            <TextField
              label="Name"
              placeholder="Name"
              helperText="Empty keeps the current name"
              fullWidth
              value={draft.newName}
              onChange={({ target }) =>
                updateDraft(account.id!, { newName: target.value })
              }
            />
            <TextField
              label="New pin"
              placeholder="Pin"
              helperText="Digits only. Empty keeps the current pin"
              fullWidth
              // A numeric keypad on the tablet this runs on
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              value={draft.pincode}
              onChange={({ target }) =>
                updateDraft(account.id!, {
                  pincode: target.value.replace(/\D/g, ""), // Allow only numbers
                })
              }
            />
            <div className="account-editor__amount">
              <CurrencyInput
                id={`${id}-amount`}
                placeholder="Amount"
                // The raw string is echoed back rather than a re-derived number, or the
                // field would reformat itself mid-typing and swallow a trailing ","
                value={draft.changeInput}
                onValueChange={(value, _name, values) => {
                  updateDraft(account.id!, {
                    changeInput: value ?? "",
                    change: values?.float ?? 0,
                  });
                }}
                decimalSeparator=","
                groupSeparator=" "
              />
              <span className="account-editor__sum">
                {(account.balance! / 100).toFixed(2)} + {draft.change} ={" "}
                {(account.balance! / 100 + draft.change).toFixed(2)}
              </span>
            </div>

            <div className="account-editor__actions">
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
                    Haluatko varmasti poistaa käyttäjän {account.username}
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
                    onClick={() => handleDelete(account.id!)}
                  >
                    KYLLÄ
                  </Button>
                </DialogActions>
              </Dialog>
              {account.closed ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => changePiikkiStatus(account)}
                >
                  Avaa piikki
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => changePiikkiStatus(account)}
                >
                  Sulje piikki
                </Button>
              )}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

// memo, not the React Compiler: the compiler memoizes values inside a component but
// does not skip re-rendering it when a parent re-renders with equal props.
export default memo(UpdateBalance);
