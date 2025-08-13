
"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { Stethoscope } from "lucide-react";

interface CustomLogoProps extends React.HTMLAttributes<HTMLDivElement> {
    logoUrl?: string | null;
}

export const CustomLogo = ({ className, ...props }: CustomLogoProps) => {
    // Usando a imagem local como padrão.
    const logoUrl = '/img/logo.png'; 

    if (logoUrl) {
        return (
            <div className={cn("relative", className)} {...props}>
                <Image
                    src={logoUrl}
                    alt="Logotipo do Sistema"
                    layout="fill"
                    objectFit="contain"
                />
            </div>
        );
    }
    
    // Fallback para um ícone padrão se nenhuma URL de logo for fornecida
    return (
        <div className={cn("flex items-center justify-center", className)} {...props}>
            <Stethoscope className="w-full h-full" />
        </div>
    );
};
