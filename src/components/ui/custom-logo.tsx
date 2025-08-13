
"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

// Corrigido para aceitar propriedades HTML de uma div, em vez de SVG.
interface CustomLogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CustomLogo = ({ className, ...props }: CustomLogoProps) => {
    const logoUrl = "https://i.ibb.co/3s5sy3g/logo.png";

    return (
        // Adicionado o spread de props para o div container.
        <div className={cn("relative", className)} {...props}>
            <Image
                src={logoUrl}
                alt="Logotipo do Sistema"
                layout="fill"
                objectFit="contain"
            />
        </div>
    );
};
