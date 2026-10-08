import type { Product, Account } from "@app/common";
import Drink from "./DrinkComponent";
import { useRef, useState } from "react";
import { Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { toast } from 'react-toastify';
import Other from "./OtherDrink";
import "../styling/aside.scss";
import axios from 'axios';

// POST /api/transaction answers with an array of per-user error strings ("Wrong pincode for X")
// on both 207 (some users charged) and 400 (nobody charged)
const describeServerError = (data: unknown, fallback: string): string => {
  if (Array.isArray(data)) {
    return data.join(", ");
  }
  if (typeof data === "string" && data !== "") {
    return data;
  }
  return fallback;
};

interface ProductContainerProps {
  drinkState: { product: Product; amount: number }[];
  className?: string;
  updateAmount: (product: string, amount: number) => void;
  users: {
    user: Account;
    pressed: boolean;
  }[];
  resetStates: () => void;
}

const ProductContainer: React.FC<ProductContainerProps> = ({
  drinkState,
  updateAmount,
  users,
  resetStates,
}) => {
  const [sum, setSum] = useState(0);
  const [other, setOther] = useState<string>("");
  const [pendingUsers, setPendingUsers] = useState<{ user: Account, pressed: boolean }[]>([]);
  const [confirmedUsers, setConfirmedUsers] = useState<{ user: Account, pressed: boolean }[]>([]);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  // One guard for every path that posts a transaction or a pin. POST /api/transaction has no
  // database transaction around its per-user loop, so a double click must not become a double
  // charge. The ref flips synchronously, before React re-renders; busy only disables the buttons.
  const requestInFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  //const [, setRecentTrans] = useState<Log[]>([]);

  // const fetchRecentTransactions = () => {
  //   fetch("/api/transaction/recent")
  //     .then((response) => response.json())
  //     .then((data: Log[]) => {
  //       setRecentTrans(data);
  //     });
  // };

  // Recent transactions left for now
  // useEffect(() => {
  //   console.log("Fetching recent...");
  //   fetchRecentTransactions();
  // }, []);

  // The free "Muu määrä" amount in cents. A single source of truth for both the total on screen
  // and the amount posted: these used to be computed by different rules, so a negative value
  // displayed a smaller total than it charged.
  const otherCents = (): number => {
    const parsed = Number.parseFloat(other);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 0;
    }
    return Math.round(parsed * 100);
  };

  const resetAll = () => {
    setEnteredPin("")
    setConfirmedUsers([])
    setPendingUsers([])
    setSum(0)
    setOther("")
    setPinError(null)
    resetStates()
    setSelectedDate(dayjs())
    requestInFlight.current = false
    setBusy(false)
  }

  const confirm = async (finalUsers: Account[]) => {
    // Names and quantities only. The server prices these from the product table; it used to
    // charge whatever pricein the client sent.
    const items = drinkState
      .filter((x) => x.amount >= 1)
      .map((x) => ({ name: x.product.name, amount: x.amount }));
    const requestOptions = {
      headers: { "Content-Type": "application/json" },
    };
    try {
      const response = await axios.post(
        "/api/transaction",
        { items, users: finalUsers, other: otherCents() },
        requestOptions
      );
      // 207 means some users were charged and some were rejected. Axios resolves on 207, so
      // without this a partial failure is indistinguishable from a success.
      if (response.status === 207) {
        toast.error(
          "Some users were not charged: " +
          describeServerError(response.data, "the server did not say which ones"),
          { autoClose: 10000 }
        );
      }
      // Still reset: the users who succeeded are already charged and nothing rolls back, so
      // keeping the order would invite a retry that charges them twice.
      resetAll();
      //fetchRecentTransactions();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const message = describeServerError(e?.response?.data, e.message);
        toast.error("Error sending transactions: " + message)
      } else if (e instanceof Error) {
        toast.error(e.message)
      } else {
        toast.error("Unexpected error")
      }

      console.log(e);
    }
  };

  const runConfirm = async (finalUsers: Account[]) => {
    if (requestInFlight.current) {
      return;
    }
    requestInFlight.current = true;
    setBusy(true);
    try {
      await confirm(finalUsers);
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  };

  const finalSum = () => {
    return (sum + otherCents()) / 100;
  };

  const handleSkip = async () => {
    const skipped = pendingUsers[0];
    // The dialog keeps its DOM through MUI's fade-out, so a second click can land here once
    // the queue is already empty
    if (!skipped || requestInFlight.current) {
      return;
    }
    const rest = pendingUsers.slice(1);
    // Read from this render: handleSkip never touches confirmedUsers, so this is the
    // authoritative list of users who are still going to be charged
    const stillToCharge = confirmedUsers.map((u) => u.user);

    // The dialog is open while pendingUsers is non-empty, so this both advances the queue and
    // closes the dialog when the skipped user was the last one
    setPendingUsers(rest);
    setEnteredPin("");
    setPinError(null);

    if (rest.length > 0) {
      // Somebody else still has to enter a pin, so only the queue moves on
      toast.info("Skipped " + skipped.user.username + ", not charged");
      return;
    }

    if (stillToCharge.length === 0) {
      // Everybody was skipped, so nothing is sent and the order is kept as it is for a retry
      toast.warn("Skipped " + skipped.user.username + ". Nobody left to charge, the order was kept");
      return;
    }

    toast.info("Skipped " + skipped.user.username + ", not charged");
    await runConfirm(stillToCharge);
  };

  // unlocked_until arrives from JSON as a possibly absent value, and "One time" passes it
  // straight through, so the parameter has to admit undefined
  const handleUnlock = async (date: Date | null | undefined) => {
    if (!date) {
      return
    }
    const subject = pendingUsers[0];
    // A click landing during the dialog's fade-out would otherwise throw inside this async
    // handler, with no feedback at all
    if (!subject || requestInFlight.current) {
      return;
    }
    const user: Account = subject.user;
    requestInFlight.current = true;
    setBusy(true);
    try {
      const headers = { "Content-Type": "application/json" };
      await axios.patch(`/api/account/unlockUntil`, {
        id: user.id!,
        pincode: enteredPin,
        unlocked_until: date
      }, { headers: headers });

      if (pendingUsers.length == 1) {
        await confirm(confirmedUsers.map(u => u.user).concat({ ...user, pincode: enteredPin }));
        setEnteredPin("");

        return;
      }

      // Remove unlocked user from pending. The pin travels with the user, because "One time"
      // writes back the same expired unlocked_until, so the backend verifies the pin again
      // when the transaction is posted.
      setConfirmedUsers((prev) => prev.concat({
        ...subject,
        user: { ...user, pincode: enteredPin }
      }))
      setPendingUsers((prev) => prev.slice(1));
      // Otherwise the next user's dialog opens pre-filled with this user's pin, with every
      // duration button already enabled
      setEnteredPin("");
      setPinError(null);

    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setPinError(describeServerError(e?.response?.data, e.message || "Unexpected error in sending pin"))
      } else if (e instanceof Error) {
        setPinError(e.message)
      } else {
        setPinError("Unexpected error")
      }
      setTimeout(() => {
        setPinError(null)
      }, 5000)
      console.log(e)
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="aside">
      <Stack spacing={2}>
        <h2>Tuotteet</h2>
        {drinkState.map((drink) => (
          <Drink
            key={drink.product.name}
            amount={drink.amount}
            drinkStates={drinkState}
            drink={drink.product}
            sum={sum}
            add={setSum}
            updateAmount={updateAmount}
          />
        ))}

        <Other other={other} setOther={setOther} />
      </Stack>
      <div className="aside-footer">
        <span className="calculated">
          Yhteensä: <strong>{finalSum().toFixed(2)} </strong>
        </span>
        <div className="buttons">
          <Button
            disabled={users.length == 0 || finalSum() <= 0 || busy}
            variant="contained"
            onClick={() => {
              const now = Date.now();
              // Mirrors needsPincode in POST /api/transaction: a pin is required only when the
              // account has one AND its unlock window has expired. Without the has_pincode check
              // the dialog opened for accounts that have no pin at all, and unlocking them threw.
              const needsPin = (u: { user: Account }) =>
                Boolean(u.user.has_pincode) &&
                Boolean(u.user.unlocked_until) &&
                new Date(u.user.unlocked_until!).getTime() < now;
              const pending = users.filter(needsPin)
              const confirmed = users.filter(u => !needsPin(u))
              if (pending.length == 0 && confirmed.length > 0) {
                void runConfirm(confirmed.map(u => u.user))
              } else {
                setPendingUsers(pending);
                setConfirmedUsers(confirmed)
              }
            }}
          >
            Vahvista
          </Button>
          <Button
            disabled={users.length == 0 || finalSum() <= 0}
            variant="contained"
            color="error"
            onClick={() => {
              setSum(0);
              setOther("");
              resetStates();
            }}
          >
            Peruuta
          </Button>
        </div>
      </div>
      <Dialog
        maxWidth="md"
        open={pendingUsers.length > 0}>
        <DialogTitle>Enter pin for {pendingUsers[0]?.user.username}</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Unlock until"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue!)}
              minDate={dayjs()}
            />
          </LocalizationProvider>
          <TextField
            placeholder="Pin"
            value={enteredPin}
            type="password"
            onChange={({ target }) => setEnteredPin(target.value)}
            error={!!pinError}
            helperText={pinError}
          />
        </DialogContent>
        <DialogActions >
          <Button className="pin-button" onClick={handleSkip} variant="contained" color="error" disabled={busy}>
            Skip
          </Button>
          <Button className="pin-button" onClick={() => handleUnlock(pendingUsers[0]?.user.unlocked_until)} variant="contained" disabled={enteredPin.length === 0 || busy}>
            One time
          </Button>
          <Button className="pin-button" onClick={() => handleUnlock(new Date(Date.now() + 60 * 60 * 1000))} variant="contained" disabled={enteredPin.length === 0 || busy}>
            1h
          </Button>
          <Button className="pin-button" onClick={() => handleUnlock(new Date(Date.now() + 3 * 60 * 60 * 1000))} variant="contained" disabled={enteredPin.length === 0 || busy}>
            3h
          </Button>
          <Button className="pin-button" onClick={() => handleUnlock(new Date(Date.now() + 8 * 60 * 60 * 1000))} variant="contained" disabled={enteredPin.length === 0 || busy}>
            8h
          </Button>
          <Button className="pin-button" onClick={() => handleUnlock(selectedDate!.toDate())} variant="contained" disabled={enteredPin.length === 0 || busy}>
            Custom time
          </Button>
          <Button className="pin-button" onClick={() => handleUnlock(new Date(Date.now() + 200 * 365 * 24 * 60 * 60 * 1000))} variant="contained" color="error" disabled={enteredPin.length === 0 || busy}>
            Permanent
          </Button>
        </DialogActions>
      </Dialog>
      {/*
      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Käyttäjä</th>
              <th>Tuote</th>
              <th>Määrä</th>
              <th>Summa</th>
              <th>Päivämäärä</th>
            </tr>
          </thead>
          <tbody>
            {recentTrans.map((tran, index) => (
              <tr key={index}>
                <td>{tran.username}</td>
                <td>{tran.product_name}</td>
                <td>{tran.amount}</td>
                <td>{(tran.sum / 100).toFixed(2)}</td>
                <td>
                  {new Date(tran.transaction_date).toLocaleString("fi-FI", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      */}
    </div>
  );
};

export default ProductContainer;
