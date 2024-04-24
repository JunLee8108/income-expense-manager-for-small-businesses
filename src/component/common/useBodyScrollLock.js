const useBodyScrollLock = () => {
  const lockBodyScroll = () => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`; // 스크롤바 너비만큼 패딩 추가
  };

  const unlockBodyScroll = () => {
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "0px"; // 패딩 제거
  };

  return [lockBodyScroll, unlockBodyScroll];
};

export default useBodyScrollLock;
