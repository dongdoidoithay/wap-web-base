export function SearchBar() {
  return (
    <form
      action="/search"
      method="GET"
      className="mx-auto max-w-screen-sm px-3 pt-3"
      role="search"
      aria-label="Tìm kiếm nội dung"
    >
      <label htmlFor="q" className="sr-only">
        Tìm kiếm
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-light bg-surface px-3 py-2 shadow-sm">
        <input
          id="q"
          name="q"
          type="search"
          placeholder="Tìm bài viết, chủ đề..."
          className="w-full bg-transparent outline-none placeholder:text-muted text-sm text-body-primary"
          autoComplete="off"
          minLength={2}
        />
        <button
          type="submit"
          className="rounded-xl px-3 py-1.5 text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
        >
          Tìm
        </button>
      </div>
    </form>
  );
}