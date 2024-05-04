import "../../App.css";

import { Fragment, useState, useEffect } from "react";
import { foodSortList } from "../util/data";
import { generateRandomID } from "../util/assignID";
import { isIDUnique } from "../util/assignID";
import usePad from "./hooks/usePad";
import { useSortByDate } from "./useSortByDate";
import AlertModal from "./modal/AlertModal";
import IncomeInsertModal from "./IncomeInsertModal";

export default function DataInsertModal({
  setDataInsert,
  activeIndex,
  date,
  year,
  month,
  expenseData,
  setExpenseData,
  taps,
  taxOn,
}) {
  const pad = usePad();
  const sortBydate = useSortByDate();

  const [IsIncomeOrExpense, setIncomeOrExpense] = useState("");
  const [itemInput, setItemInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAlertModal, setAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleIncomeOrExpense = (type) => () => {
    setIncomeOrExpense(type);
  };

  const handleform = (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const body = {};
    for (const [key, value] of form.entries()) {
      body[key] = value;
    }

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

    let uniqueID;
    do {
      uniqueID = generateRandomID();
    } while (!isIDUnique(uniqueID, expenseData));

    const data = {
      date: date + "-" + pad(parseInt(body.day)),
      year: parseInt(year),
      month: month,
      day: parseInt(body.day),
      from: body.from || taps[activeIndex],
      category: body.category,
      item: itemInput.toUpperCase(),
      amount: parseFloat(body.amount),
      tax: parseFloat(body.tax) || 0.0,
      id: uniqueID,
    };

    sortBydate([...expenseData, data], "on", setExpenseData);
    setDataInsert(false);
  };

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

  useEffect(() => {
    if (itemInput.length >= 2) {
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
            setDataInsert(false);
          }
        }}
      >
        {IsIncomeOrExpense === "" && (
          <div className="item-input-choose animation">
            <h2>Choose income or expense</h2>
            <div className="item-input-choose-button-container">
              <button onClick={handleIncomeOrExpense("income")}>Income</button>
              <button onClick={handleIncomeOrExpense("expense")}>
                Expense
              </button>
            </div>
          </div>
        )}

        {IsIncomeOrExpense === "income" && (
          <IncomeInsertModal setDataInsert={setDataInsert} month={month} />
        )}

        {IsIncomeOrExpense === "expense" && (
          <form
            className="item-input-container animation"
            onSubmit={handleform}
            onClick={() => setShowSuggestions(false)}
          >
            <button
              className="item-input-closebtn"
              type="button"
              onClick={() => {
                setDataInsert(false);
              }}
            >
              X
            </button>

            <h2 className="item-input-header">Insert Item</h2>

            <div className="item-input-box">
              <label htmlFor="date">Date</label>
              <input
                className="item-input"
                id="date"
                value={date}
                disabled="disabled"
              ></input>
            </div>

            <div className="item-input-box">
              <label htmlFor="day">* Day</label>
              <input
                className="item-input"
                placeholder="몇일.."
                name="day"
                required
              ></input>
            </div>

            {taps[activeIndex] === "Overview" ? (
              <div className="item-input-box">
                <label htmlFor="from">* From (출처)</label>
                <select
                  className="item-select"
                  id="from"
                  defaultValue=""
                  required
                  name="from"
                >
                  <option value="" disabled>
                    Please Choose...
                  </option>
                  {taps.map((content, index) => {
                    return (
                      <Fragment key={index}>
                        {content !== "Overview" ? (
                          <option>{content}</option>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div className="item-input-box">
                <label htmlFor="from">From (출처)</label>
                <input
                  className="item-input"
                  id="from"
                  value={taps[activeIndex]}
                  disabled={true}
                ></input>
              </div>
            )}

            <div className="item-input-box">
              <label htmlFor="category">* Category (분류)</label>
              <select
                className="item-select"
                id="category"
                defaultValue=""
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
              <label htmlFor="category">* Item (품목)</label>
              <div className="item-input-suggestion">
                <input
                  className="item-input"
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
                placeholder="$"
                name="amount"
                required
              ></input>
            </div>

            <button type="submit" className="item-input-submit">
              SUBMIT
            </button>
          </form>
        )}
      </div>

      {isAlertModal && (
        <AlertModal setAlertModal={setAlertModal} message={alertMessage} />
      )}
    </>
  );
}
