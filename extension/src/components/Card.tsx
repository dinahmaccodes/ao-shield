import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const Card = ({
  children,
  className = "",
  onClick,
  hover = true,
}: CardProps) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        bg-[#111] border border-white/10 rounded-xl p-4 
        ${hover ? "hover:border-white/20 transition-all cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
