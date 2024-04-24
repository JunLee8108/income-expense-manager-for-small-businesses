import "./AddTap.css";

import { useRef, useState, useEffect } from "react";

export default function AddTapModal({
  setTaps,
  taps,
  selectedTap,
  setSelectedTap,
  setConfirmModal,
  setMessage,
  setAlertModal,
  setAlertMessage,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle Toggle Dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Handle Add Form
  const handleAddform = (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const tapName = form.get("tap");
    const tapNameNormalized = tapName.replace(/\s+/g, "").toLowerCase();

    if (
      taps
        .map((tap) => tap.replace(/\s+/g, "").toLocaleLowerCase())
        .includes(tapNameNormalized)
    ) {
      setAlertModal(true);
      setAlertMessage(
        `${tapName} already exists.\n(${tapName}이(가) 이미 존재합니다.)`
      );

      return;
    }

    localStorage.setItem("taps", JSON.stringify([...taps, tapName]));
    setTaps([...taps, tapName]);

    setAlertModal(true);
    setAlertMessage(
      `${tapName} was added.\n(${tapName}이(가) 추가 되었습니다.)`
    );

    e.target.reset();
  };

  // Handle Delete Form
  const handleDeleteform = (e) => {
    e.preventDefault();

    if (!selectedTap) return;

    setConfirmModal(true);
    setMessage(
      `Do you want to remove "${selectedTap}" tab? All items in this tab also will be removed!\n\n(탭에 속해 있는 모든 아이템들도 지워집니다!)`
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
      <form className="add-tap" onSubmit={handleAddform}>
        <h3>• Add Tap (탭 추가)</h3>
        <input id="tap" name="tap" placeholder="Tap name.." required></input>
        <button type="submit">ADD</button>
      </form>

      <form className="delete-tap" onSubmit={handleDeleteform}>
        <h3>• Delete Tap (탭 삭제)</h3>

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
              {taps
                .filter((tap) => tap !== "Overview")
                .map((tap, index) => (
                  <div
                    key={index}
                    className="dropdown-item"
                    onClick={() => handleSelectTap(tap)}
                  >
                    {tap}
                  </div>
                ))}
            </div>
          )}
        </div>

        <button type="submit" className="delete-tap-delete-button">
          DELETE
        </button>
      </form>
    </>
  );
}
