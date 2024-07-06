import "./AddTap.css";
import { useRecoilState } from "recoil";
import { tapsState, expenseCategoryTabsState } from "../../recoil/store";

import { useRef, useState, useEffect } from "react";

export default function AddTapModal({
  type,
  selectedTap,
  setSelectedTap,
  setConfirmModal,
  setMessage,
  setAlertModal,
  setAlertMessage,
}) {
  const [taps, setTaps] = useRecoilState(tapsState);
  const [expenseCategoryTabs, setExpenseCategoryTabs] = useRecoilState(
    expenseCategoryTabsState
  );

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const tabName = type === "expenseCategoryTabs" ? "Category" : "From";
  const tabsData = type === "expenseCategoryTabs" ? expenseCategoryTabs : taps;
  const setTabsData =
    type === "expenseCategoryTabs" ? setExpenseCategoryTabs : setTaps;

  // Handle Toggle Dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Handle Add Form
  const handleAddForm = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const tapName = form.get("tap").trim(); // Ensure whitespace is removed and handle as a plain string
    const tapNameNormalized = tapName.toLowerCase();

    if (tabsData.includes(tapNameNormalized)) {
      setAlertModal(true);
      setAlertMessage(
        `${tapName} already exists. (${tapName}이(가) 이미 존재합니다.)`
      );
      return;
    }

    const updatedTabs = [...tabsData, tapName];
    localStorage.setItem(type, JSON.stringify(updatedTabs));
    setTabsData(updatedTabs);
    setAlertModal(true);
    setAlertMessage(
      `${tapName} was added. (${tapName}이(가) 추가 되었습니다.)`
    );
    e.target.reset();
  };

  // Handle Delete Form
  const handleDeleteForm = (e) => {
    e.preventDefault();
    if (!selectedTap) return;
    setConfirmModal(true);
    setMessage(
      `Do you want to remove "${selectedTap}" tab? All items in this tab also will be removed! (탭에 속해 있는 모든 아이템들도 지워집니다!)`
    );
  };

  // Handle Select Tap
  const handleSelectTap = (tap) => {
    setSelectedTap(tap);
    setIsOpen(false);
  };

  // Close Dropdown When Clicking Outside
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

  return (
    <>
      <div className="add-tap-container">
        <form className="add-tap" onSubmit={handleAddForm}>
          <h3>
            Add {tabName} Tap{" "}
            <span style={{ fontSize: "0.9rem" }}>(탭 추가)</span>
          </h3>
          <input id="tap" name="tap" placeholder="Tap name.." required></input>
          <button type="submit">ADD</button>
        </form>

        <form className="delete-tap" onSubmit={handleDeleteForm}>
          <h3>
            Delete {tabName} Tap{" "}
            <span style={{ fontSize: "0.9rem" }}>(탭 삭제)</span>
          </h3>

          <div className="dropdown" ref={dropdownRef}>
            <button
              className="dropdown-toggle"
              onClick={toggleDropdown}
              type="button"
            >
              {selectedTap || "Select Tap"} <span>&#9660;</span>
            </button>

            {isOpen && (
              <div className="dropdown-menu">
                {tabsData.map((tap, index) => {
                  if (tap !== "Overview") {
                    return (
                      <div
                        key={index}
                        className="dropdown-item"
                        onClick={() => handleSelectTap(tap)}
                      >
                        {tap}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          <button type="submit" className="delete-tap-delete-button">
            DELETE
          </button>
        </form>
      </div>
    </>
  );
}
