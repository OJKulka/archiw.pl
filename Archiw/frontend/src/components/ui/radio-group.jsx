import React, { createContext, useContext } from "react";

const RadioContext = createContext(null);

export const RadioGroup = ({ value, onValueChange, children, className = "" }) => {
  return (
    <RadioContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </RadioContext.Provider>
  );
};

export const RadioGroupItem = ({ value, id, "data-testid": dataTestId }) => {
  const ctx = useContext(RadioContext);

  return (
    <input
      type="radio"
      id={id}
      name="radio-group"
      value={value}
      checked={ctx?.value === value}
      onChange={() => ctx?.onValueChange?.(value)}
      data-testid={dataTestId}
    />
  );
};