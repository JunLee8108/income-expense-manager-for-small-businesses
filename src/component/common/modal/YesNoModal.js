import React from "react";
import "./Modal.css";

import { useEffect } from "react";

const YesNoModal = ({
  setConfirmModal,
  isConfirmModal,
  onConfirm,
  message,
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        if (isConfirmModal) {
          onConfirm();
          setConfirmModal(false);
        }
      }

      if (event.key === "Escape") {
        if (isConfirmModal) {
          setConfirmModal(false);
        }
      }
    };

    if (isConfirmModal) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isConfirmModal, onConfirm, setConfirmModal]);

  return (
    <>
      <div
        className="item-input-bg yes-no-modal"
        onClick={(e) => {
          const target = document.querySelector(".item-input-bg.yes-no-modal");
          if (e.target === target) {
            setConfirmModal(false);
          }
        }}
      >
        <div className="modal-content animation">
          <p>{message}</p>
          <button
            className="modal-button"
            onClick={() => {
              onConfirm();
              setConfirmModal(false);
            }}
          >
            Yes
          </button>
          <button
            className="modal-button"
            onClick={() => setConfirmModal(false)}
          >
            No
          </button>
        </div>
      </div>
    </>
  );
};
export default YesNoModal;
