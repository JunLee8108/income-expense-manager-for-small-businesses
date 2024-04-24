import "../../App.css";
import { foodSortList } from "../util/data";
import usePad from "./usePad";
import { useSortByDate } from "./useSortByDate";
import AlertModal from "./modal/AlertModal";

import { Fragment, useState, useEffect, useRef } from "react";

export default function DataEditModal({
  setEditBtn,
  editIndex,
  setExpenseData,
  expenseData,
  taps,
  taxOn,
}) {
  const sortByDate = useSortByDate();
  const pad = usePad();

  const editData = expenseData.filter((data) => data.id === editIndex);

  const [itemInput, setItemInput] = useState(editData[0].item);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAlertModal, setAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const yourElement = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Tab" && suggestions.length > 0) {
      e.preventDefault(); // Prevent the default tab behavior
      setItemInput(suggestions[0]); // Set the input to the first suggestion
      setTimeout(() => {
        setShowSuggestions(false); // Hide the suggestions
        setSuggestions([]); // Clear suggestions
      }, 20);
    }
  };

  const handleEditform = (e) => {
    e.preventDefault();

    // FORM DATA
    const form = new FormData(e.currentTarget);
    const body = {};
    for (const [key, value] of form.entries()) {
      body[key] = value;
    }

    const intDay = parseInt(body.day);

    // ERROR HANDLING
    if (
      !/^-?\d*\.?\d+$/.test(body.amount) ||
      !/^-?\d*\.?\d+$/.test(body.tax ? body.tax : 0.0)
    ) {
      setAlertModal(true);
      setAlertMessage("Error: Invalid amount or tax");
      return;
    }

    if (
      !/^\d+$/.test(body.day) ||
      isNaN(parseInt(body.day)) ||
      parseInt(body.day) > 31 ||
      parseInt(body.day) < 1
    ) {
      setAlertModal(true);
      setAlertMessage("Error: Invalid day");
      return;
    }

    if (!body.year) {
      setAlertModal(true);
      setAlertMessage("Error: Invalid date");
      return;
    }

    const parts = body.year.split("-");

    const updatedExpenseData = expenseData.map(
      (data) =>
        data.id === editIndex
          ? {
              ...data, // 기존 데이터 복사
              date: `${body.year}-${pad(intDay)}`, // 새로운 값으로 업데이트
              year: Number(parts[0]),
              day: Number(body.day),
              month: parts[1],
              from: body.from,
              category: body.category,
              item: itemInput.toUpperCase(),
              tax: parseFloat(body.tax) || 0,
              amount: parseFloat(body.amount),
            }
          : data // ID가 일치하지 않는 항목은 그대로 유지
    );

    // DATA SORT
    if (updatedExpenseData.length > 1) {
      sortByDate(updatedExpenseData, "on", setExpenseData);
    } else {
      setExpenseData(updatedExpenseData);
    }

    setEditBtn(false);
  };

  useEffect(() => {
    if (
      itemInput.length >= 2 &&
      yourElement.current === document.activeElement
    ) {
      const filteredSuggestions = expenseData
        .filter((item) =>
          item.item
            .replace(" ", "")
            .toLocaleLowerCase()
            .includes(itemInput.replace(" ", "").toLocaleLowerCase())
        )
        .map((item) => item.item.toUpperCase());

      const uniqueSuggestions = Array.from(new Set(filteredSuggestions));

      setSuggestions(uniqueSuggestions);

      if (filteredSuggestions.length > 0) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [itemInput, expenseData]);

  return (
    <>
      <div
        className="item-input-bg"
        onClick={(e) => {
          const target = document.querySelector(".item-input-bg");
          if (e.target === target) {
            setEditBtn(false);
          }
        }}
      >
        <form
          className="item-input-container animation"
          onSubmit={handleEditform}
          onClick={() => setShowSuggestions(false)}
        >
          <button
            className="item-input-closebtn"
            type="button"
            onClick={() => setEditBtn(false)}
          >
            X
          </button>

          <h2 className="item-input-header">Edit Item</h2>

          <div className="item-input-box">
            <label htmlFor="year">* Date (연도/월)</label>
            <input
              className="item-select"
              id="year"
              name="year"
              type="month"
              defaultValue={editData[0].year + "-" + editData[0].month}
            ></input>
          </div>

          <div className="item-input-box">
            <label htmlFor="day">* Day</label>
            <input
              className="item-input"
              placeholder="몇일.."
              defaultValue={editData[0].day}
              name="day"
            ></input>
          </div>

          <div className="item-input-box">
            <label htmlFor="from">* From (출처)</label>
            <select
              className="item-select"
              id="from"
              defaultValue={editData[0].from}
              required
              name="from"
            >
              {taps.map((content, index) => {
                return (
                  <Fragment key={index}>
                    {content !== "Overview" ? <option>{content}</option> : null}
                  </Fragment>
                );
              })}
            </select>
          </div>

          <div className="item-input-box">
            <label htmlFor="category">* Category (종류)</label>
            <select
              className="item-select"
              id="category"
              defaultValue={
                editData[0].category === undefined ? "" : editData[0].category
              }
              name="category"
            >
              <option value="" disabled>
                Please Choose...
              </option>
              {foodSortList.map((content, index) => {
                return (
                  <Fragment key={index}>
                    <option>{content.name}</option>
                  </Fragment>
                );
              })}
            </select>
          </div>

          <div className="item-input-box">
            <label htmlFor="item">* Item (품목)</label>
            <div className="item-input-suggestion">
              <input
                className="item-input"
                ref={yourElement}
                id="item"
                placeholder="품목.."
                name="item"
                type="text"
                value={itemInput}
                onChange={(e) => {
                  setItemInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
              ></input>
              {showSuggestions && (
                <div className="suggestions-container">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={(e) => {
                        setItemInput(suggestion);
                        e.stopPropagation();

                        setTimeout(() => {
                          setShowSuggestions(false);
                          setSuggestions([]);
                        }, 20);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {taxOn ? (
            <div className="item-input-box">
              <label htmlFor="tax">* Tax (세금)</label>
              <input
                className="item-input"
                id="tax"
                defaultValue={editData[0].tax}
                placeholder="$"
                name="tax"
              ></input>
            </div>
          ) : null}

          <div className="item-input-box">
            <label htmlFor="amount">* Amount (가격)</label>
            <input
              className="item-input"
              id="amount"
              defaultValue={editData[0].amount}
              placeholder="$"
              name="amount"
            ></input>
          </div>

          <button type="submit" className="item-input-submit">
            SUBMIT
          </button>
        </form>
      </div>

      {isAlertModal && (
        <AlertModal setAlertModal={setAlertModal} message={alertMessage} />
      )}
    </>
  );
}
