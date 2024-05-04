export default function DateSelector({
  handleExpenseDate,
  date,
  isAllChecked,
  handleAllChecked,
}) {
  const parts = date.split("-");
  const year = parts[0];

  return (
    <section className="app-month-year">
      <input
        type="month"
        className="app-month"
        onChange={handleExpenseDate}
        value={date}
      ></input>

      <label className="switch">
        <input
          type="checkbox"
          id="all"
          name="all"
          checked={isAllChecked}
          onChange={handleAllChecked}
        />
        <span className="slider"></span>
      </label>
      <label htmlFor="all" className="all-label">
        {year} All (전체)
      </label>
    </section>
  );
}
