import { useCallback } from "react";

export const useSortByDate = () => {
  try {
    const sortByDate = useCallback((data, setData, sortingOrder) => {
      const copy = [...data];

      if (sortingOrder === "ascending") {
        copy.sort((a, b) => {
          const dateA = new Date(a.date.replaceAll("-", "/"));
          const dateB = new Date(b.date.replaceAll("-", "/"));
          return dateA - dateB;
        });
      } else {
        copy.sort((a, b) => {
          const dateA = new Date(a.date.replaceAll("-", "/"));
          const dateB = new Date(b.date.replaceAll("-", "/"));
          return dateB - dateA;
        });
      }

      setData(copy);
    }, []);

    return sortByDate;
  } catch (error) {
    console.log("error:", error);
  }
};
