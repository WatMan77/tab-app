import type { Product, Account } from "@app/common";
import { Color } from "@app/common";
import Drink from "./DrinkComponent";
import { useState } from "react";
import { Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { toast } from 'react-toastify';
import Other from "./OtherDrink";
import "../styling/aside.scss";
import axios from 'axios';

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

  const resetAll = () => {
    setEnteredPin("")
    setConfirmedUsers([])
    setPendingUsers([])
    setSum(0)
    setOther("")
    setPinError(null)
    resetStates()
    setSelectedDate(dayjs())
  }

  const confirm = async (finalUsers: Account[]) => {
    const items = drinkState.filter((x) => x.amount >= 1);
    if (parseFloat(other) > 0) {
      const otherFloat = parseFloat(other);
      const otherFixed = otherFloat.toFixed(2);
      const otherProduct: { product: Product; amount: number } = {
        product: {
          name: "MUU",
          pricein: parseFloat(otherFixed) * 100,
          priceout: 0,
          color: Color.EMPTY, // Inserted as Color is required
        },
        amount: 1,
      };
      items.push(otherProduct);
    }
    const requestOptions = {
      headers: { "Content-Type": "application/json" },
    };
    try {
      await axios.post("/api/transaction", { items, users: finalUsers }, requestOptions);
      resetAll();
      //fetchRecentTransactions();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const message = e?.response?.data && e.response.data !== "" ?
          e.response.data : e.message;
        toast.error("Error sending transactions: " + message)
      } else if (e instanceof Error) {
        toast.error(e.message)
      } else {
        toast.error("Unexpected error")
      }

      console.log(e);
    }
  };

  const finalSum = () => {
    if (other === "") {
      return sum / 100;
    } else {
      return (sum + parseFloat(other) * 100) / 100;
    }
  };

  const handleSkip = () => {
    if (pendingUsers.length == 1) {
      resetAll()
      return;
    }
    setPendingUsers((prev) => prev.slice(1)); // remove first pending user
    setEnteredPin("");
  };

  const handleUnlock = async (date: Date | null) => {
    if (!date || date === null) {
      return
    }
    const user: Account = pendingUsers[0].user;
    try {
      const headers = { "Content-Type": "application/json" };
      await axios.patch(`/api/account/unlockUntil`, {
        id: user.id!,
        pincode: enteredPin,
        unlocked_until: date
      }, { headers: headers });

      // Clear PIN input

      if (pendingUsers.length == 1) {
        await confirm(confirmedUsers.map(u => u.user).concat({ ...pendingUsers[0].user, pincode: enteredPin }));
        setEnteredPin("");

        return;
      }

      // Remove unlocked user from pending
      setConfirmedUsers((prev) => prev.concat(pendingUsers[0]))
      setPendingUsers((prev) => prev.slice(1));

    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setPinError(e?.response?.data || e.message || "Unexpected error in sending pin")
      } else if (e instanceof Error) {
        setPinError(e.message)
      } else {
        setPinError("Unexpected error")
      }
      setTimeout(() => {
        setPinError(null)
      }, 5000)
      console.log(e)
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
            disabled={users.length == 0 || finalSum() <= 0}
            variant="contained"
            onClick={() => {
              const now = Date.now();
              const pending = users.filter(u => u.user.unlocked_until && new Date(u.user.unlocked_until).getTime() < now)
              const confirmed = users.filter(u => !u.user.unlocked_until || new Date(u.user.unlocked_until).getTime() >= now)
              if (pending.length == 0 && confirmed.length > 0) {
                confirm(confirmed.map(u => u.user))
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
          <Button className="pin-button" onClick={handleSkip} variant="contained" color="error">
            Skip
          </Button>
          <Button className="pin-button" onClick={() => handleUnlock(pendingUsers[0]?.user.unlocked_until)} variant="contained" disabled={enteredPin.length === 0}>
            One time
          </Button>
          <Button className="pin-button" onClick={() => handleUnlock(new Date(Date.now() + 60 * 60 * 1000))} variant="contained" disabled={enteredPin.length === 0}>
            1h
          </Button>
          <Button className="pin-button" onClick={() => handleUnlock(new Date(Date.now() + 3 * 60 * 60 * 1000))} variant="contained" disabled={enteredPin.length === 0}>
            3h
          </Button>
          <Button className="pin-button" onClick={() => handleUnlock(new Date(Date.now() + 8 * 60 * 60 * 1000))} variant="contained" disabled={enteredPin.length === 0}>
            8h
          </Button>
          <Button className="pin-button" onClick={() => handleUnlock(selectedDate!.toDate())} variant="contained" disabled={enteredPin.length === 0}>
            Custom time
          </Button>
          <Button className="pin-button" onClick={() => handleUnlock(new Date(Date.now() + 200 * 365 * 24 * 60 * 60 * 1000))} variant="contained" color="error" disabled={enteredPin.length === 0}>
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
