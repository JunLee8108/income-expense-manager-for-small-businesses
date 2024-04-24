import { useCallback } from "react";

function usePad() {
  // useCallback을 사용하여 컴포넌트가 리렌더링될 때마다 함수가 새로 생성되는 것을 방지합니다.
  const pad = useCallback((d) => {
    return d < 10 ? "0" + d.toString() : d.toString();
  }, []);

  // pad 함수 자체를 반환합니다.
  return pad;
}

export default usePad;
