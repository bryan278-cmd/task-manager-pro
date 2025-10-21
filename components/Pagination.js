import React from "react";

function PageButton({ label, page, totalPages, target, onChange }) {
  const isPrev = label === "Prev";
  const isNext = label === "Next";
  const isDisabled = (isPrev && page <= 1) || (isNext && page >= totalPages);
  const isActive = !label && target === page;

  return (
    <button
      className="btn btn-ghost"
      aria-label={label ? label : `Go to page ${target}`}
      aria-current={isActive ? "page" : undefined}
      onClick={() => (!label ? onChange(target) : onChange(isPrev ? page - 1 : page + 1))}
      disabled={label ? isDisabled : isActive}
    >
      {label ?? target}
    </button>
  );
}

function buildPages(page, totalPages) {
  const out = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  if (start > 1) {
    out.push(1);
    if (start > 2) out.push("…pre");
  }
  for (let n = start; n <= end; n++) out.push(n);
  if (end < totalPages) {
    if (end < totalPages - 1) out.push("…post");
    out.push(totalPages);
  }
  return out;
}

function PaginationInner({ page, totalPages, onChange }) {
  const pages = React.useMemo(() => buildPages(page, totalPages), [page, totalPages]);
  return (
    <nav aria-label="Pagination" className="pagination">
      <PageButton label="Prev" page={page} totalPages={totalPages} onChange={onChange} />
      {pages.map((p, idx) =>
        typeof p === "number" ? (
          <PageButton key={p} page={page} totalPages={totalPages} target={p} onChange={onChange} />
        ) : (
          <span key={p + idx} className="pg-ellipsis">…</span>
        )
      )}
      <PageButton label="Next" page={page} totalPages={totalPages} onChange={onChange} />
    </nav>
  );
}

export const Pagination = React.memo(PaginationInner);
