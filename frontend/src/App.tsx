import { UserType } from "./types";
import type { Account, Product } from "./types";
import UserBlock from "./components/UserBlock";
import { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import "./styling/accounts.css";
import ProductContainer from "./components/ProductContainer";

//import "./App.css";

const App = () => {
  const [users, setUsers] = useState<{ user: Account; pressed: boolean }[]>([]);
  const [drinkStates, setDrinkStates] = useState<
    { product: Product; amount: number }[]
  >([]);

  const changePress = (username: string) => {
    const updatedUsers = users.map((x) => {
      if (x.user.username === username) {
        console.log(`Changed ${x.user.username} to ${!x.pressed}`);
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

  const resetStates = (): void => {
    const updatedProducts = drinkStates.map((p) => {
      return { ...p, amount: 0 };
    });
    const updatedUsers = users.map((u) => {
      return { ...u, pressed: false };
    });
    setDrinkStates(updatedProducts);
    setUsers(updatedUsers);
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/account")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.map((user: Account) => ({ user, pressed: false })));
      });
    fetch("http://localhost:3000/api/product")
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
      direction="row"
      justifyContent="flex-start"
      alignItems="stretch"
      spacing={2}
    >
      <div>
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
        <div className="account-grid">
          {users
            .filter((x) => x.user.category === UserType.VANHA)
            .map((u) => (
              <UserBlock
                user={u}
                changePress={changePress}
                key={u.user.username}
              />
            ))}
        </div>
        <h2>Hangaroundit</h2>
        <div className="account-grid">
          {users
            .filter((x) => x.user.category === UserType.HANGAROUND)
            .map((u) => (
              <UserBlock
                user={u}
                changePress={changePress}
                key={u.user.username}
              />
            ))}
        </div>
      </div>
      <ProductContainer
        className="prodcut-column"
        drinkState={drinkStates}
        updateAmount={updateAmount}
        users={users.filter((u) => u.pressed)}
        resetStates={resetStates}
      />
    </Stack>
  );
};

export default App;
