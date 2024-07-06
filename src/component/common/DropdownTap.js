import "./DropdownMenu.css";

import useBodyScrollLock from "./useBodyScrollLock";

import { useRecoilValue } from "recoil";
import { tapsState } from "../../recoil/store";

import { useState, useEffect, useRef } from "react";

function DropdownTap({ handleFromTap, activeIndex }) {
  const taps = useRecoilValue(tapsState);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTap, setSelectedTap] = useState(taps[activeIndex]);
  const dropdownRef = useRef(null);
  const [lockBodyScroll, unlockBodyScroll] = useBodyScrollLock();
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (dropdownRef.current) {
      dropdownRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const handleSelectTap = (tap, index) => {
    setSelectedTap(tap);
    setIsOpen(false);
    handleFromTap(index)();
    unlockBodyScroll();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSelectedTap(taps[activeIndex]);
  }, [taps, activeIndex]);

  return (
    <div className="dropdown dropdown-tap" ref={dropdownRef}>
      <button
        className="dropdown-toggle dropdown-tap-toggle"
        onClick={toggleDropdown}
      >
        <span style={{ width: "100%", textAlign: "center" }}>
          {selectedTap}
        </span>
        <span className={`arrow-icon ${isOpen ? "rotate-up" : ""}`} style={{}}>
          &#9650;
        </span>
      </button>

      {isOpen && (
        <div
          className="dropdown-menu dropdown-tap-menu animation-down"
          onMouseEnter={lockBodyScroll}
          onMouseLeave={unlockBodyScroll}
        >
          {taps.map((tap, index) => (
            <div
              key={index}
              className="dropdown-item"
              onClick={() => handleSelectTap(tap, index)}
            >
              {tap}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DropdownTap;
