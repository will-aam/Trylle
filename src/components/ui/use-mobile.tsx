import { useState, useEffect } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Define o estado inicial após a montagem do componente no cliente
    handleResize();

    // Adiciona o listener para mudanças de tamanho
    window.addEventListener("resize", handleResize);

    // Remove o listener quando o componente é desmontado
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
};
