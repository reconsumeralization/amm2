import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-md flex items-center justify-center">
        <span className="text-white font-bold text-sm">MM</span>
      </div>
      <span className="text-xl font-bold text-gray-800">ModernMen</span>
      <span className="text-sm text-gray-500 font-medium">Admin</span>
    </div>
  );
};

export default Logo;