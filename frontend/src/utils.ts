import type { Account } from "@app/common";

type Named = Pick<Account, "username">;

// numeric makes room-number prefixes sort naturally ("99. " before "325. ")
export const compareAccounts = (a: Named, b: Named): number =>
  a.username.localeCompare(b.username, undefined, { numeric: true });

export const matchesSearch = ({ username }: Named, query: string): boolean =>
  username.toLowerCase().includes(query.toLowerCase());
