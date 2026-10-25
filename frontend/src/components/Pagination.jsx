const Pagination = ({ page, pageSize, totalItems, totalPages, onPageChange }) => {
    if (totalItems === 0) {
        return null;
    }

    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalItems);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
                Showing {startItem}–{endItem} of {totalItems}
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                >
                    Previous
                </button>
                <span className="min-w-20 text-center text-sm text-slate-600">
                    Page {page} of {totalPages}
                </span>
                <button
                    type="button"
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;
