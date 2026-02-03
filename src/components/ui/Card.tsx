import { cn } from '../../lib/utils';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card = ({ children, className, ...props }: CardProps) => {
    return (
        <div
            className={cn("bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl", className)}
            {...props}
        >
            {children}
        </div>
    );
};
