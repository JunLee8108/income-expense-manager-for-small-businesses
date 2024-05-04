import React from "react";
import "./Modal.css";

import { useState, useEffect, useRef } from "react";

const RequestPasswordForFileLoad = ({
  setModal,
  type,
  onSubmit,
  isAlertModal,
}) => {
  const [capsLockWarning, setCapsLockWarning] = useState(false);
  const inputRef = useRef(null);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    inputRef.current.blur();
    const password = new FormData(e.currentTarget).get("password");
    onSubmit(password);
  };

  const handleKeyPress = (e) => {
    const isCapsLockOn = e.getModifierState("CapsLock");
    setCapsLockWarning(isCapsLockOn);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (!isAlertModal) {
          event.stopPropagation();
          setModal(false);
        }
      }
    };

    if (!isAlertModal) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setModal, isAlertModal]);

  return (
    <>
      <div
        className="item-input-bg request-password-modal"
        onClick={(e) => {
          const target = document.querySelector(
            ".item-input-bg.request-password-modal"
          );
          if (e.target === target) {
            setModal(false);
          }
        }}
      >
        <form className="modal-content animation" onSubmit={handleOnSubmit}>
          <p>{type}</p>
          <input
            className="modal-input"
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            ref={inputRef}
            onKeyUp={handleKeyPress}
          ></input>
          {capsLockWarning && (
            <p className="caps-lock-warning">* Caps Lock is ON</p>
          )}
          <button className="modal-button">Submit</button>
        </form>
      </div>
    </>
  );
};
export default RequestPasswordForFileLoad;
