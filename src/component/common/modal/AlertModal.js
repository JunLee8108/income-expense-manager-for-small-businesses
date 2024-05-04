import React from "react";
import "./Modal.css";
import { useEffect } from "react";

const AlertModal = ({ setAlertModal, message }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" || event.key === "Escape") {
        event.stopPropagation();
        setAlertModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setAlertModal]);

  return (
    <div
      className="item-input-bg alert-modal"
      onClick={(e) => {
        const target = document.querySelector(".item-input-bg.alert-modal");
        if (e.target === target) {
          setAlertModal(false);
        }
      }}
    >
      <div className="modal-content animation">
        <p>{message}</p>
        <button className="modal-button" onClick={() => setAlertModal(false)}>
          OK
        </button>
      </div>
    </div>
  );
};
export default AlertModal;
