import { useEffect, useState } from "react";

const DEFAULT_PAGE_SIZE = 10;

const usePagination = (items, resetKey) => {
    const [page, setPage] = useState(1);
    const pageSize = DEFAULT_PAGE_SIZE;
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    useEffect(() => {
        setPage(1);
    }, [resetKey]);

    useEffect(() => {
        setPage((currentPage) => Math.min(currentPage, totalPages));
    }, [totalPages]);

    return {
        page,
        pageSize,
        totalItems,
        totalPages,
        pageItems: items.slice((page - 1) * pageSize, page * pageSize),
        setPage
    };
};

export default usePagination;
