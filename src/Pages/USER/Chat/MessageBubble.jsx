"use client";
import { MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MessageBubble({ content, type }) {
  const user = useSelector((state) => state.user.userDatas);
  
  // Separate logic for AI and user avatars
  const getAvatarFallback = () => {
    if (type === 'ai') return 'AI';
    
    // User avatar fallback
    if (user) {
      // Prefer username or initials
      if (user.username) return user.username.slice(0,2).toUpperCase();
      if (user.name) {
        return user.name.split(' ')
          .map(name => name[0])
          .join('')
          .toUpperCase()
          .slice(0,2);
      }
    }
    
    return 'CC';
  };

  const getAvatarImage = () => {
    if (type === 'ai') return null; // No image for AI
    
    // User avatar image logic
    return user && user.profileImage ? user.profileImage : null;
  };

  return (
    <div className={`flex items-start space-x-3 ${type === 'ai' ? 'flex-row-reverse' : ''}`}>
      <Avatar>
        {getAvatarImage() && (
          <AvatarImage 
            src={getAvatarImage()} 
            alt={type === 'ai' ? 'AI Assistant' : 'User Profile'} 
          />
        )}
        <AvatarFallback className={`
          ${type === 'ai' 
            ? 'bg-green-500 text-white' 
            : 'bg-blue-500 text-white'
          }
        `}>
          {getAvatarFallback()}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex-grow max-w-[80%] ${type === 'ai' ? 'text-right' : 'text-left'}`}>
        <div className={`
          p-3 rounded-lg 
          ${type === 'ai' 
            ? 'dark:bg-green-800 dark:text-green-100 bg-green-100 text-green-1200' 
            : 'dark:bg-gray-700 dark:text-gray-100 bg-gray-100 text-gray-800'
          }
        `}>
          {content.split("\n").map((line, index) => (
            <p key={index} className="mb-1 last:mb-0">{line}</p>
          ))}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-white dark:hover:bg-gray-700">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="dark:bg-gray-800 dark:border-gray-700">
            <DropdownMenuItem className="dark:text-white dark:hover:bg-gray-700">Copy</DropdownMenuItem>
            <DropdownMenuItem className="dark:text-white dark:hover:bg-gray-700">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}