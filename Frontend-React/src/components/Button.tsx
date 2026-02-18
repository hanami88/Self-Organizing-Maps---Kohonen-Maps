interface ButtonProps {
  color: "black" | "blue";
  children: React.ReactNode;
  className?: string;
}

export function Button({ color, className = "", children }: ButtonProps) {
  const colorClasses = {
    black: "border-black hover:bg-black hover:text-white",
    blue: "border-blue-500 bg-blue-500 text-white hover:opacity-[0.8]",
  };
  return (
    <button
      className={`${className} px-[0.7rem] py-[0.3rem] flex justify-between items-center border-[0.08rem] rounded-md font-medium ${colorClasses[color]}`}
    >
      {children}
    </button>
  );
}
