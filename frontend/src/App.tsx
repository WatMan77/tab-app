import { UserType } from "./types";
import type { Account, Product } from "./types";
import UserBlock from "./components/UserBlock";
import { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import "./styling/accounts.scss";
import CategoryWrapper from "./components/CategoryWrapper";
import ProductContainer from "./components/ProductContainer";

import "./App.scss";

const App = () => {
  const [users, setUsers] = useState<{ user: Account; pressed: boolean }[]>([]);
  const [drinkStates, setDrinkStates] = useState<
    { product: Product; amount: number }[]
  >([]);

  const [vanhatNameFilter, setVanhatNameFilter] = useState("");
  const [hangNameFilter, setHangNameFilter] = useState("");

  const changePress = (username: string) => {
    const updatedUsers = users.map((x) => {
      if (x.user.username === username) {
        return { ...x, pressed: !x.pressed };
      } else {
        return x;
      }
    });
    setUsers(updatedUsers);
  };

  const updateAmount = (product: string, increase: number) => {
    const updatedProducts = drinkStates.map((p) => {
      if (p.product.name === product) {
        return { ...p, amount: p.amount + increase };
      } else {
        return p;
      }
    });
    setDrinkStates(updatedProducts);
  };

  const fetchAccounts = (): void => {
    fetch("/api/account/transactions")
      .then((response) => response.json())
      .then((data) => {
        const sorted = [...data].sort(
          (a: { username: string }, b: { username: string }) =>
            a.username.localeCompare(b.username)
        );
        setUsers(sorted.map((user: Account) => ({ user, pressed: false })));
      });
  };

  const resetStates = (): void => {
    const updatedProducts = drinkStates.map((p) => {
      return { ...p, amount: 0 };
    });
    const updatedUsers = users.map((u) => {
      return { ...u, pressed: false };
    });
    setDrinkStates(updatedProducts);
    setUsers(updatedUsers);
    fetchAccounts();
    setVanhatNameFilter("");
    setHangNameFilter("");
  };

  useEffect(() => {
    fetchAccounts();
    fetch("/api/product")
      .then((response) => response.json())
      .then((data: Product[]) => {
        setDrinkStates(
          data.map((x) => {
            return { product: x, amount: 0 };
          })
        );
      });
  }, []);

  return (
    <Stack
      className="wrapper"
      direction="row"
      justifyContent="flex-start"
      alignItems="stretch"
      spacing={2}
    >
      <div className="main-content">
        <h2>Asukkaat</h2>
        <div className="account-grid">
          {users
            .filter((x) => x.user.category === UserType.ASUKAS)
            .map((u) => (
              <UserBlock
                user={u}
                changePress={changePress}
                key={u.user.username}
              />
            ))}
        </div>

        <h2>Vanhat</h2>
        <CategoryWrapper
          changePress={changePress}
          users={users.filter((x) => x.user.category === UserType.VANHA)}
          nameFilter={vanhatNameFilter}
          setNameFilter={setVanhatNameFilter}
        />
        <h2>Hangaroundit</h2>
        <CategoryWrapper
          changePress={changePress}
          users={users.filter((x) => x.user.category === UserType.HANGAROUND)}
          nameFilter={hangNameFilter}
          setNameFilter={setHangNameFilter}
        />
      </div>
      <ProductContainer
        className="product-column"
        drinkState={drinkStates}
        updateAmount={updateAmount}
        users={users.filter((u) => u.pressed)}
        resetStates={resetStates}
      />
    </Stack>
  );
};

export default App;
