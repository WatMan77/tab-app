import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Account, Product } from "../../types";
import NewUser from "./NewAccount";
import UpdateBalance from "./UpdateBalance";
import { Button } from "@mui/material";
import NewProduct from "./NewProduct";
import EditProduct from "./EditProduct";

const AdminPanel = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<{ account: Account; change: number }[]>(
    []
  );

  const [products, setProducts] = useState<Product[]>([]);

  //console.log("Users?", users);
  useEffect(() => {
    const userData = window.localStorage.getItem("loggedPiikkiAdmin");
    if (!userData) {
      navigate("/");
      return;
    }
    // const parsed = JSON.parse(userData);
    // if (parsed.username && parsed.token) {
    //   setAdmin(parsed);
    // }

    fetch("http://localhost:3000/api/account")
      .then((res) => res.json())
      .then((data) => {
        setUsers(
          (data as Account[]).map((u: Account) => {
            return { account: u, change: 0 };
          })
        );
      });

    fetch("http://localhost:3000/api/product")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data as Product[]);
      });
  }, [navigate]);

  // Do we even have to update the state within? We simply have to know the amount we
  // want to add and send the request as a list of ... What? New amounts completely or
  // the amounts we want to add? --> Let's send the new amount. Then we can actually send the
  // new "state" and simply update the amounts.

  const handleBalanceChange = (id: number, change: number) => {
    const newState = users.map((u) => {
      if (u.account.id === id) {
        return { ...u, change };
      } else {
        return u;
      }
    });
    setUsers(newState);
  };

  const handleChangeConfirm = async () => {
    const filteredUsers = users.filter((u) => u.change !== 0);
    const updatedChangeUsers: Account[] = filteredUsers.map((u) => ({
      ...u.account,
      balance: u.account.balance! + u.change * 100,
    }));

    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accounts: updatedChangeUsers,
      }),
    };
    try {
      await fetch("http://localhost:3000/api/balance", requestOptions);
    } catch (e) {
      console.log(e);
    }
    window.location.reload();
  };
  return (
    <>
      <h1>Hi! You have reached the admin panel!</h1>
      <NewUser />
      {users.map((u) => (
        <UpdateBalance
          key={u.account.id!}
          user={u}
          handleBalanceChange={handleBalanceChange}
        />
      ))}
      <Button variant="contained" onClick={handleChangeConfirm}>
        Confirm
      </Button>
      <br></br>
      <NewProduct />
      {products.map((p) => (
        <EditProduct key={p.name} product={p} />
      ))}
    </>
  );
};

export default AdminPanel;
