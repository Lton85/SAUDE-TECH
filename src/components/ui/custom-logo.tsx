
"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { Stethoscope } from "lucide-react";

interface CustomLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  logoUrl?: string | null;
}

export const CustomLogo = ({ className, logoUrl: propLogoUrl, ...props }: CustomLogoProps) => {
    // URL do logotipo fixo para toda a aplicação.
    const fixedLogoUrl = "https://i.ibb.co/3s5sy3g/logo.png";

    return (
        <div className={cn("relative", className)} {...props}>
            <Image
                src={fixedLogoUrl}
                alt="Logotipo do Sistema"
                layout="fill"
                objectFit="contain"
                unoptimized
            />
        </div>
    );
};
