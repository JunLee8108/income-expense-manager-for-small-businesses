import { useCallback } from "react";

// Custom hook for sorting data
export const useSortByFrom = () => {
  const sortByFrom = useCallback((data, setData) => {
    const copy = [...data];

    copy.sort((a, b) => {
      let fa = a.category.toLowerCase();
      let fb = b.category.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    copy.sort((a, b) => {
      let fa = a.from.toLowerCase();
      let fb = b.from.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    copy.sort(
      (a, b) =>
        parseInt(a.date.replaceAll("-", "")) -
        parseInt(b.date.replaceAll("-", ""))
    );

    setData(copy);
  }, []);

  return sortByFrom;
};
