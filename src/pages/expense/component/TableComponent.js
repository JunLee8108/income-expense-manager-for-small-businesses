// TableComponent.js
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function TableComponent({
  data,
  headers,
  handleSort,
  sortConfig,
  handleCheck,
  isTableHeadChecked,
  handleAllCheck,
  checkedItems,
  handleEdit,
  currentPage,
  itemsPerPage,
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              onChange={handleAllCheck}
              checked={isTableHeadChecked}
            />
          </th>
          <th>#</th>
          {headers.map(({ key, label, type }) => (
            <th key={key} onClick={() => handleSort(key, type)}>
              {label}
              {sortConfig.key === key && (
                <FontAwesomeIcon
                  icon={
                    sortConfig.direction === "ascending"
                      ? "fa-solid fa-arrow-up"
                      : "fa-solid fa-arrow-down"
                  }
                />
              )}
            </th>
          ))}
          <th>Action</th>
        </tr>
      </thead>

      {data.map((content, index) => {
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;

        return (
          <tbody key={index}>
            <tr>
              <td>
                <input
                  type="checkbox"
                  checked={!!checkedItems[content.id]}
                  onChange={() => handleCheck(content.id)}
                />
              </td>
              <td>{itemNumber}</td>

              {headers.map(({ key }) => (
                <td key={key + index}>
                  {key === "amount" && (
                    <span style={{ marginRight: "4px" }}>$</span>
                  )}
                  {content[key]}
                </td> // item 객체에서 key를 사용하여 값을 추출합니다
              ))}

              <td>
                <button
                  onClick={handleEdit(content.id)}
                  className="item-edit-btn"
                >
                  EDIT
                </button>
              </td>
            </tr>
          </tbody>
        );
      })}
    </table>
  );
}

export default TableComponent;
