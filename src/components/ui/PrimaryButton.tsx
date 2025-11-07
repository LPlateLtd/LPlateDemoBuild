import { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  fullWidth?: boolean;
}

export default function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  loadingText = "Loading...",
  className = "",
  fullWidth = false,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        font-semibold py-3 px-6 rounded-lg transition-all duration-200
        hover:scale-105 disabled:hover:scale-100
        bg-green-500 hover:bg-green-600 disabled:bg-gray-400
        text-white
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.trim()}
    >
      {loading ? loadingText : children}
    </button>
  );
}

