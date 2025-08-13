
"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { Stethoscope } from "lucide-react";

interface CustomLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  logoUrl?: string | null;
}

export const CustomLogo = ({ className, logoUrl, ...props }: CustomLogoProps) => {

    if (logoUrl) {
        return (
            <div className={cn("relative", className)} {...props}>
                <Image
                    src={logoUrl}
                    alt="Logotipo do Sistema"
                    layout="fill"
                    objectFit="contain"
                    unoptimized // Use this if you have issues with optimized images from external sources
                />
            </div>
        );
    }
    
    // Fallback Icon
    return (
        <div className={cn("flex items-center justify-center", className)} {...props}>
            <Stethoscope className="w-full h-full" />
        </div>
    );
};
