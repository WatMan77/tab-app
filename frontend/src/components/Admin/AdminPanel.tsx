import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Account } from "../../types";
import NewUser from "./NewAccount";
import UpdateUser from "./UpdateUser";

const AdminPanel = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<{ account: Account; change: number }[]>(
    []
  );

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
  return (
    <>
      <h1>Hi! You have reached the admin panel!</h1>
      <NewUser />
      {users.map((u) => (
        <UpdateUser
          key={u.account.id!}
          user={u}
          handleBalanceChange={handleBalanceChange}
        />
      ))}
    </>
  );
};

export default AdminPanel;
