
"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { Stethoscope } from "lucide-react";

interface CustomLogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CustomLogo = ({ className, ...props }: CustomLogoProps) => {
    // URL do logotipo fixo para toda a aplicação.
    const fixedLogoUrl = "https://i.ibb.co/pwnVLr0/logo-saude.png";

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
