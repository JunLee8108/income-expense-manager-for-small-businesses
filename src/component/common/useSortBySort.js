import { useCallback } from "react";

export const useSortBySort = () => {
  const sortBySort = useCallback((data, setData) => {
    const sortedData = [...data].sort((a, b) => {
      let fa = a.from.toLowerCase(),
        fb = b.from.toLowerCase();
      if (fa !== fb) return fa < fb ? -1 : 1;
      fa = a.date;
      fb = b.date;
      if (fa !== fb) return fa < fb ? -1 : 1;
      fa = a.category.toLowerCase();
      fb = b.category.toLowerCase();
      return fa < fb ? -1 : 1;
    });
    setData(sortedData);
  }, []);

  return sortBySort;
};
