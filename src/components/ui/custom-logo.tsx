
"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { Stethoscope } from "lucide-react";
import logo from "@/img/logo.png"; // Import the local image

interface CustomLogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CustomLogo = ({ className, ...props }: CustomLogoProps) => {
    // Usando a imagem local importada como padrão.
    if (logo) {
        return (
            <div className={cn("relative", className)} {...props}>
                <Image
                    src={logo}
                    alt="Logotipo do Sistema"
                    fill
                    style={{ objectFit: 'contain' }}
                    priority // Add priority to preload the logo
                />
            </div>
        );
    }
    
    // Fallback para um ícone padrão se a imagem não puder ser importada.
    return (
        <div className={cn("flex items-center justify-center", className)} {...props}>
            <Stethoscope className="w-full h-full" />
        </div>
    );
};
