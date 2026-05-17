import React from 'react';
import { MdSecurity, MdHelpOutline, MdFeedback } from 'react-icons/md';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-gray-900 py-10 px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center text-[10px] font-black text-white">FN</div>
            <span className="text-sm font-bold text-gray-500">Fitnova v1.0.4</span>
          </div>
          <div className="h-4 w-[1px] bg-gray-800 hidden md:block"></div>
          <p className="text-xs text-gray-600 font-medium">© 2026 Fitnova Labs. All rights reserved.</p>
        </div>

        <div className="flex items-center gap-8 text-gray-600">
          <a href="#" className="flex items-center gap-2 text-xs font-bold hover:text-white transition-colors">
            <MdSecurity /> Privacy & Security
          </a>
          <a href="#" className="flex items-center gap-2 text-xs font-bold hover:text-white transition-colors">
            <MdHelpOutline /> Help Center
          </a>
          <a href="#" className="flex items-center gap-2 text-xs font-bold hover:text-white transition-colors">
            <MdFeedback /> Give Feedback
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
