const AppFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer mt-auto border-t border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-500 backdrop-blur">
      <span>© {year} Thép G90.</span>
      <span className="mx-2">•</span>
      <span>Nền tảng điều hành doanh nghiệp.</span>
    </footer>
  );
};

export default AppFooter;
