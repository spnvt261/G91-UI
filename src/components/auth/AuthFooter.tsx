const AuthFooter = () => {
  const year = new Date().getFullYear();

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 text-center text-sm text-slate-500">
      © {year} G90 Steel. Vận hành doanh nghiệp tập trung.
    </div>
  );
};

export default AuthFooter;
