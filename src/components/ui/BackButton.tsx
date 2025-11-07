import Link from "next/link";

interface BackButtonProps {
  href: string;
  className?: string;
}

export default function BackButton({ href, className = "" }: BackButtonProps) {
  return (
    <Link 
      href={href} 
      className={`text-gray-600 hover:text-gray-800 transition-colors ${className}`}
      aria-label="Go back"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 19l-7-7 7-7" 
        />
      </svg>
    </Link>
  );
}

