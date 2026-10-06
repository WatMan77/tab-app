import { useLayoutEffect, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import type { Account } from "@app/common";
import UpdateBalance, { EMPTY_DRAFT, type Draft } from "./UpdateBalance";

// Only the rows near the viewport are rendered. With 100+ accounts, mounting every
// row at once blocks the main thread long enough that clicks on the nav bar are
// queued behind it and the page looks frozen until the whole list is up.
const AccountList: React.FC<{
  accounts: Account[];
  drafts: Record<number, Draft>;
  expandedIds: Set<number>;
  onToggleExpanded: (id: number, expanded: boolean) => void;
  updateDraft: (id: number, patch: Partial<Draft>) => void;
  changePiikkiStatus: (account: Account) => void;
  handleDelete: (id: number) => void;
}> = ({
  accounts,
  drafts,
  expandedIds,
  onToggleExpanded,
  updateDraft,
  changePiikkiStatus,
  handleDelete,
}) => {
  // The React Compiler memoizes getTotalSize() and getVirtualItems() on the stable
  // identity of the virtualizer, so the re-render it forces after measuring a row
  // returns the same frozen offsets and expanded rows overlap the ones below them.
  "use no memo";

  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  // The list starts partway down the page, below the new-user box and the filter bar,
  // but the window virtualizer measures offsets from the top of the document.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () =>
      setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
    measure();
    const observer = new ResizeObserver(measure);
    if (el.parentElement) observer.observe(el.parentElement);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: accounts.length,
    estimateSize: () => 84, // a collapsed row: AccordionSummary plus the gap
    overscan: 5,
    scrollMargin,
    // Keyed by id, not username: a username can be renamed through a draft
    getItemKey: (index) => accounts[index]!.id!,
  });

  return (
    <div
      ref={listRef}
      style={{ position: "relative", height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map((item) => {
        const account = accounts[item.index]!;
        return (
          <div
            key={item.key}
            data-index={item.index}
            ref={virtualizer.measureElement}
            className="virtual-row"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              // item.start is an offset into the document, and this container already
              // sits scrollMargin down the page
              transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
            }}
          >
            <UpdateBalance
              account={account}
              draft={drafts[account.id!] ?? EMPTY_DRAFT}
              expanded={expandedIds.has(account.id!)}
              onToggleExpanded={onToggleExpanded}
              updateDraft={updateDraft}
              changePiikkiStatus={changePiikkiStatus}
              handleDelete={handleDelete}
            />
          </div>
        );
      })}
    </div>
  );
};

export default AccountList;
