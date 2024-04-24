import { useCallback } from "react";

export const useSortByCategory = () => {
  const sortByCategory = useCallback((data, setData) => {
    const sortedData = [...data].sort((a, b) => {
      const fa = -parseInt(a.date.replaceAll("-", "")),
        fb = -parseInt(b.date.replaceAll("-", ""));
      if (fa !== fb) return fa < fb ? -1 : 1;
      return a.item.toLowerCase() < b.item.toLowerCase() ? -1 : 1;
    });
    setData(sortedData);
  }, []);

  return sortByCategory;
};
