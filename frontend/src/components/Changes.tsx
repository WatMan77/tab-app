import { useEffect, useState } from "react";
import type { BalanceChange } from "../types";
import "../styling/transactions.scss";
const Changes = () => {
  const [changes, setChanges] = useState<BalanceChange[]>([]);
  console.log("CHANGES!");
  useEffect(() => {
    fetch("/api/changes")
      .then((x) => x.json())
      .then((data) => setChanges(data));
  }, []);
  return (
    <div className="transactions-container">
      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Käyttäjä</th>
              <th>Määrä</th>
              <th>Päivämäärä</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((change) => (
              <tr key={change.username + " " + change.change_date}>
                <td>{change.username}</td>
                <td>{(change.change / 100).toFixed(0)}</td>
                <td>
                  {new Date(change.change_date).toLocaleString("fi-FI", {
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
    </div>
  );
};

export default Changes;
