import { UserType } from "./types";
import type { Account, Product } from "./types";
import UserBlock from "./components/UserBlock";
import { useEffect, useState, useMemo } from "react";
import { Stack } from "@mui/material";
import "./styling/accounts.scss";
import CategoryWrapper from "./components/CategoryWrapper";
import ProductContainer from "./components/ProductContainer";
import { io } from "socket.io-client";

const socket = io(import.meta.env["VITE_API_URL"] || "http://localhost:3000");

const App = () => {
  const [users, setUsers] = useState<{ user: Account; pressed: boolean }[]>([]);
  const [drinkStates, setDrinkStates] = useState<
    { product: Product; amount: number }[]
  >([]);
  const [vanhatNameFilter, setVanhatNameFilter] = useState("");
  const [hangNameFilter, setHangNameFilter] = useState("");

  const changePress = (id: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.user.id! === id ? { ...user, pressed: !user.pressed } : user
      )
    );
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
    socket.on("accounts-updated", () => {
      fetchAccounts();
    });

    return () => {
      socket.off("accounts-updated");
    };
  }, []);
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

  const asukasUsers = useMemo(
    () => users.filter((x) => x.user.category === UserType.ASUKAS),
    [users]
  );

  const vanhatUsers = useMemo(
    () => users.filter((x) => x.user.category === UserType.VANHA),
    [users]
  );

  const hangaroundUsers = useMemo(
    () => users.filter((x) => x.user.category === UserType.HANGAROUND),
    [users]
  );

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
          {asukasUsers.map((u) => (
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
          users={vanhatUsers}
          nameFilter={vanhatNameFilter}
          setNameFilter={setVanhatNameFilter}
        />
        <h2>Hangaroundit</h2>
        <CategoryWrapper
          changePress={changePress}
          users={hangaroundUsers}
          nameFilter={hangNameFilter}
          setNameFilter={setHangNameFilter}
        />
      </div>
      <div className="product-column">
        <ProductContainer
          drinkState={drinkStates}
          updateAmount={updateAmount}
          users={users.filter((u) => u.pressed)}
          resetStates={resetStates}
        />
      </div>
    </Stack>
  );
};

export default App;
