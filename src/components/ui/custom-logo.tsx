
"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface CustomLogoProps extends React.SVGProps<SVGSVGElement> {}

export const CustomLogo = ({ className, ...props }: CustomLogoProps) => {
    const logoUrl = "https://i.ibb.co/3s5sy3g/logo.png";

    return (
        <div className={cn("relative", className)}>
            <Image
                src={logoUrl}
                alt="Logotipo do Sistema"
                layout="fill"
                objectFit="contain"
            />
        </div>
    );
};
