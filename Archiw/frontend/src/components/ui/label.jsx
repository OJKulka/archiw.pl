export const Label = ({ children, className = "", ...props }) => {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
};