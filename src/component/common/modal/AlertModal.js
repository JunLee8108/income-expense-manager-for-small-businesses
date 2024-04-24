import React from "react";
import "./Modal.css";

const AlertModal = ({ setAlertModal, message }) => {
  return (
    <div
      className="item-input-bg"
      onClick={(e) => {
        const target = document.querySelector(".item-input-bg");
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
