import type { Account, Product } from "@app/common";
import { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import "./styling/accounts.scss";
import CategoryWrapper from "./components/CategoryWrapper";
import ProductContainer from "./components/ProductContainer";
import { io } from "socket.io-client";
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const socket = io(import.meta.env["VITE_API_URL"] || "http://localhost:3000");

const App = () => {
  const navigate = useNavigate();


  useEffect(() => {
    axios.get("/api/admin/admin-check")
      .then(({ data }) => {
        if (!data.adminExists) {
          navigate("/create-admin")
        }
      })
  }, [])

  const [users, setUsers] = useState<{ user: Account; pressed: boolean }[]>([]);
  const [drinkStates, setDrinkStates] = useState<
    { product: Product; amount: number }[]
  >([]);
  const [vanhatNameFilter, setVanhatNameFilter] = useState("");

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
    axios.get("/api/account/transactions")
      .then((data) => {
        const sorted = [...data.data].sort(
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
  };

  useEffect(() => {
    // Disable scrolling for this page;
    if (process.env.NODE_ENV === "production") {
      document.body.style.overflow = "hidden";
    }
    socket.on("accounts-updated", () => {
      fetchAccounts();
    });

    return () => {
      socket.off("accounts-updated");
      if (process.env.NODE_ENV !== "dev") {
        document.body.style.overflow = "auto";
      }
    };
  }, []);
  useEffect(() => {
    fetchAccounts();
    axios.get("/api/product")
      .then(res => {
        const products: Product[] = res.data;
        setDrinkStates(
          products.map((x) => {
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

        <h2>Users</h2>
        <CategoryWrapper
          changePress={changePress}
          users={users}
          nameFilter={vanhatNameFilter}
          setNameFilter={setVanhatNameFilter}
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
