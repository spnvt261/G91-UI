import { useEffect, useRef, useState } from "react";

const UserAvatarDropdown = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full px-2 py-1 text-white hover:bg-white/10"
      >
        <div className="h-8 w-8 rounded-full bg-amber-300 text-center text-sm font-semibold leading-8 text-blue-950">A</div>
        <span className="text-sm font-medium">Nguyen Van A</span>
        <span className="text-xs">?</span>
      </button>

      {open ? (
        <ul className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-lg bg-white text-sm text-slate-700 shadow-lg">
          <li className="cursor-pointer px-3 py-2 hover:bg-blue-50">Profile</li>
          <li className="cursor-pointer px-3 py-2 hover:bg-blue-50">Settings</li>
          <li className="cursor-pointer px-3 py-2 text-red-600 hover:bg-red-50">Logout</li>
        </ul>
      ) : null}
    </div>
  );
};

export default UserAvatarDropdown;