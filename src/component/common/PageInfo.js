export default function PageInfo({ totalPages, currentPage }) {
  return (
    <div className={`current-page-info ${totalPages < 1 ? "invisible" : ""}`}>
      <p>
        Page {currentPage} of {totalPages}
      </p>
    </div>
  );
}
