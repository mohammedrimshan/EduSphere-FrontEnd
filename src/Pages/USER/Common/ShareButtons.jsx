import React from 'react'; 
import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';  

export const ShareButtons = ({ url, title }) => {   
  const encodedUrl = encodeURIComponent(url);   
  const encodedTitle = encodeURIComponent(title);    
  
  return (     
    <div className="flex space-x-4">       
      <a         
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}         
        target="_blank"         
        rel="noopener noreferrer"         
        className="text-green-600 hover:text-green-800"       
      >         
        <FaFacebookF size={20} />       
      </a>       
      <a         
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}         
        target="_blank"         
        rel="noopener noreferrer"         
        className="text-green-500 hover:text-green-700"       
      >         
        <FaTwitter size={20} />       
      </a>       
      <a         
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}         
        target="_blank"         
        rel="noopener noreferrer"         
        className="text-green-700 hover:text-green-900"       
      >         
        <FaLinkedinIn size={20} />       
      </a>     
    </div>   
  ); 
};