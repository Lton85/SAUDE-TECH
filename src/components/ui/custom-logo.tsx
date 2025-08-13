
"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import DOMPurify from 'isomorphic-dompurify';

const DefaultLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
    >
      <g>
        <path
          d="M192,64H144V16a16,16,0,0,0-32,0V64H64a16,16,0,0,0,0,32h48v48H64a16,16,0,0,0,0,32h48v48a16,16,0,0,0,32,0V176h48a16,16,0,0,0,0-32H144V96h48a16,16,0,0,0,0-32Z"
          className="fill-primary/70"
        />
        <path
          d="M144,16a16,16,0,0,0-16,16V64H80a16,16,0,0,0-16,16v48H16a16,16,0,0,0,0,32H64v16a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V144h32.7a72.2,72.2,0,0,1-43.2-46.5,16,16,0,1,0-31,8.9A104.2,104.2,0,0,0,224,144a16,16,0,0,0,0-32h-8a88.1,88.1,0,0,0-76-74.4V32A16,16,0,0,0,144,16Zm19.2,24a8.1,8.1,0,1,1,0,16,8,8,0,0,1,0-16ZM51.2,40a8,8,0,1,1-16,0,8,8,0,0,1,16,0ZM35.2,88a8,8,0,1,1,16,0,8,8,0,0,1-16,0Z"
          className="fill-primary"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; -10 0; 0 0"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
);


interface CustomLogoProps extends React.SVGProps<SVGSVGElement> {}

export const CustomLogo = ({ className, ...props }: CustomLogoProps) => {
    const logoUrl = "https://i.ibb.co/kXq3wzG/logo.png";

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
