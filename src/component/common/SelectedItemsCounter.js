import "./SelectedItemsCounter.css";
import YesNoModal from "./modal/YesNoModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function SelectedItemsCounter({
  length,
  checkedItems,
  setCheckedItems,
  expenseData,
  setExpenseData,
}) {
  const [isConfirmModal, setConfirmModal] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = () => {
    setConfirmModal(true);
    setMessage(`Do you want to remove ${length} item(s)? (삭제 하시겠습니까?)`);
  };

  const handleOnConfirm = () => {
    const copy = [...expenseData].filter((item) => !checkedItems[item.id]);
    setExpenseData(copy);
  };

  return (
    <>
      <div className="selected-items animation-selected-items">
        <h2>
          <FontAwesomeIcon
            icon="fa-solid fa-square-check"
            style={{ marginRight: "7px", width: "17px" }}
          />
          {length} Items Selected
        </h2>
        <button onClick={() => setCheckedItems({})}>
          Deselect All(전체 선택 해제)
        </button>

        <button onClick={handleDelete}>Delete(삭제)</button>
      </div>

      {isConfirmModal && (
        <YesNoModal
          setConfirmModal={setConfirmModal}
          isConfirmModal={isConfirmModal}
          message={message}
          onConfirm={handleOnConfirm}
        />
      )}
    </>
  );
}
