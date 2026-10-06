import AccountList from "./AccountList";
import type { Draft } from "./UpdateBalance";
import { EMPTY_DRAFT } from "./UpdateBalance";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import type { Account, UpdateAccount } from "@app/common";
import NewUser from "./NewAccount";
import { Button, Dialog, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import "../../styling/balanceadmin.scss";
import { toast } from "react-toastify";
import axios, { type AxiosRequestConfig } from "axios";
import { compareAccounts, matchesSearch } from "../../utils";

const ACCOUNTS_KEY = ["accounts"];

const BalanceAdmin = () => {
  // Server data and the admin's unsaved edits are kept apart: one keystroke then only
  // changes one row's draft, and a refetch cannot wipe edits that are in progress.
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [filterInput, setFilterInput] = useState("");
  const [showClosed, setShowClosed] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const queryClient = useQueryClient();

  const token = useMemo(
    () => JSON.parse(window.localStorage.getItem("loggedPiikkiAdmin")!).token as string,
    []
  );

  const requestOptions: AxiosRequestConfig = useMemo(
    () => ({ headers: { "Content-Type": "application/json", "Authorization": token } }),
    [token]
  );

  const {
    data: accounts = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: async () => {
      const { data } = await axios.get<Account[]>("/api/account");
      return [...data].sort(compareAccounts); // the sorted array is what gets cached
    },
    staleTime: 60_000,
    // A background refetch re-sorts the list, which would move it under a row the
    // admin is editing.
    refetchOnWindowFocus: false,
  });

  const invalidateAccounts = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
  }, [queryClient]);

  const balanceSum =
    accounts.map((a) => a.balance!).reduce((a, b) => a + b, 0) / 100;

  const updateDraft = useCallback((id: number, patch: Partial<Draft>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_DRAFT), ...patch } }));
  }, []);

  const handleToggleExpanded = useCallback((id: number, expanded: boolean) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (expanded) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const fetchStats = useCallback(async (): Promise<string> => {
    const res = await axios.get("/api/account/stats", { headers: requestOptions.headers });
    const rows: { username: string; balance: number; closed: boolean }[] = res.data;

    const usernames = rows.map((u) => u.username);
    const balances = rows.map((u) => (u.balance / 100).toFixed(2));
    const closeds = rows.map((u) => String(u.closed));

    const usernameWidth = Math.max("username".length, ...usernames.map((s) => s.length));
    const balanceWidth = Math.max("balance".length, ...balances.map((s) => s.length));
    const closedWidth = Math.max("closed".length, ...closeds.map((s) => s.length));

    // Helper function
    const pad = (text: string, width: number) => text + " ".repeat(width - text.length);

    const header =
      pad("username", usernameWidth) +
      " | " +
      pad("balance", balanceWidth) +
      " | " +
      pad("closed", closedWidth);

    const separator = `${"-".repeat(usernameWidth)}-+-${"-".repeat(balanceWidth)}-+-${"-".repeat(closedWidth)}`;

    const data = rows
      .map(
        (u) =>
          pad(u.username, usernameWidth) +
          " | " +
          pad((u.balance / 100).toFixed(2), balanceWidth) +
          " | " +
          pad(String(u.closed), closedWidth)
      )
      .join("\n");

    return `${header}\n${separator}\n${data}`;

  }, [requestOptions]);

  // Only fetched once the dialog is actually opened. The key is nested under
  // ACCOUNTS_KEY so invalidating the accounts prefix-matches it too.
  const { data: stats = "" } = useQuery({
    queryKey: ["accounts", "stats"],
    queryFn: fetchStats,
    enabled: showStats,
    staleTime: 30_000,
  });

  const changePiikkiStatus = useCallback(async (account: Account) => {
    try {
      await axios.put("/api/account/closed", account, requestOptions);
      invalidateAccounts();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const message = e?.response?.data && e.response.data !== "" ?
          e.response.data : e.message;
        toast.error("Error fetching products: " + message)
      } else {
        toast.error("Failed to update piikki status: ")
      }
      console.log(e);
    }
  }, [requestOptions, invalidateAccounts]);

  const handleChangeConfirm = async () => {
    const updatedChangeUsers: UpdateAccount[] = accounts.flatMap((account) => {
      const draft = drafts[account.id!];
      if (!draft) {
        return [];
      }
      const changed =
        draft.change !== 0 ||
        draft.newName !== "" ||
        draft.pincode !== "";
      if (!changed) {
        return [];
      }
      return [{
        ...account,
        balance: account.balance! + draft.change * 100,
        newName: draft.newName,
        change: draft.change * 100,
        pincode: draft.pincode
      }];
    });
    if (updatedChangeUsers.length == 0) {
      return;
    }

    try {
      await axios.put("/api/balance", { accounts: updatedChangeUsers }, requestOptions);
      // The drafts have been applied, so keeping them would re-apply the same
      // balance delta on the next confirm.
      setDrafts({});
      setExpandedIds(new Set());
      invalidateAccounts();
    } catch (e) {
      console.log(e);
    }
  };

  const handleDelete = useCallback(async (id: number) => {
    try {
      await axios.delete(`/api/account/${id}`, requestOptions);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      invalidateAccounts();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        toast.error("Error deleting account: " + e.response?.data)
      } else if (e instanceof Error) {
        toast.error(e.message)
      } else {
        toast.error("Unexpected error: " + e)
      }
      console.log(e);
    }
  }, [requestOptions, invalidateAccounts]);

  // The typed characters land immediately, the re-filter runs at transition priority
  // and is interrupted by the next keystroke.
  const deferredFilter = useDeferredValue(filterInput);

  const visibleAccounts = useMemo(() => {
    let filtered = accounts;
    if (showClosed) {
      filtered = filtered.filter((a) => a.closed);
    }
    if (deferredFilter.length >= 3) {
      filtered = filtered.filter((a) => matchesSearch(a, deferredFilter));
    }
    return filtered;
  }, [accounts, showClosed, deferredFilter]);

  return (
    <div className="container container--balance">
      <NewUser fetchUsers={invalidateAccounts} />

      <div className="filter">
        <TextField
          label="Filter name"
          value={filterInput}
          onChange={({ target }) => setFilterInput(target.value)}
        />
        <Button
          className={showClosed ? "closed" : ""}
          variant="contained"
          onClick={() => setShowClosed(!showClosed)}
        >
          Closed
        </Button>
      </div>

      {isPending && <p>Loading...</p>}
      {error && <p>Could not load the accounts: {error.message}</p>}

      <AccountList
        accounts={visibleAccounts}
        drafts={drafts}
        expandedIds={expandedIds}
        onToggleExpanded={handleToggleExpanded}
        updateDraft={updateDraft}
        changePiikkiStatus={changePiikkiStatus}
        handleDelete={handleDelete}
      />
      <Dialog
        open={showStats}
        onClose={() => setShowStats(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Piikki balances
        </DialogTitle>
        <DialogContentText style={{ overflowX: "auto" }}>
          <pre
            style={{
              fontFamily: "monospace",
              margin: 0,
              padding: "1rem 1rem 1rem 2rem",
              backgroundColor: "black",
              borderRadius: "4px",
            }}
          >
            {stats}
          </pre>
        </DialogContentText>

      </Dialog>

      <div className="balance-footer">
        <div className="container">
          <p>
            Piikin tilanne: <strong>{balanceSum.toFixed(2)}</strong>
          </p>
          <Button variant="contained" onClick={() => setShowStats(true)}>
            Copy stats
          </Button>

          <Button variant="contained" onClick={handleChangeConfirm}>
            Confirm change
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BalanceAdmin;
