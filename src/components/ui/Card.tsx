import { cn } from '../../lib/utils';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card = ({ children, className, ...props }: CardProps) => {
    return (
        <div
            className={cn("bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl text-slate-900 dark:text-slate-200", className)}
            {...props}
        >
            {children}
        </div>
    );
};
