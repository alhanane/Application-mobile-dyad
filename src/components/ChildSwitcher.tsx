"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface Child {
  id: string;
  name: string;
  class: string;
  avatar: string;
}

interface ChildSwitcherProps {
  childrenList: Child[];
  selectedChildId: string;
  onSelect: (id: string) => void;
}

const ChildSwitcher = ({ childrenList, selectedChildId, onSelect }: ChildSwitcherProps) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
      {childrenList.map((child) => {
        const isSelected = child.id === selectedChildId;
        return (
          <button
            key={child.id}
            onClick={() => onSelect(child.id)}
            className="flex flex-col items-center gap-2 min-w-[70px] transition-all"
          >
            <div className={cn(
              "p-1 rounded-full border-2 transition-all duration-300",
              isSelected ? "border-indigo-600 scale-110 shadow-md" : "border-transparent opacity-60"
            )}>
              <Avatar className="h-12 w-12 border-2 border-white">
                <AvatarImage src={child.avatar} />
                <AvatarFallback>{child.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            <span className={cn(
              "text-[10px] font-bold transition-colors",
              isSelected ? "text-indigo-600" : "text-slate-400"
            )}>
              {child.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ChildSwitcher;