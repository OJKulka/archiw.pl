import React, { createContext, useContext, useState } from "react";

const DropdownContext = createContext(null);

export const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
};

export const DropdownMenuTrigger = ({ children }) => {
  const ctx = useContext(DropdownContext);

  return (
    <button type="button" onClick={() => ctx?.setOpen(!ctx.open)}>
      {children}
    </button>
  );
};

export const DropdownMenuContent = ({ children, className = "" }) => {
  const ctx = useContext(DropdownContext);

  if (!ctx?.open) return null;

  return (
    <div className={`absolute right-0 top-full mt-2 z-50 ${className}`}>
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, className = "" }) => {
  const ctx = useContext(DropdownContext);

  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.(e);
        ctx?.setOpen(false);
      }}
      className={`block w-full text-left px-3 py-2 ${className}`}
    >
      {children}
    </button>
  );
};

export const DropdownMenuSeparator = ({ className = "" }) => {
  return <div className={`h-px my-1 ${className}`} />;
};