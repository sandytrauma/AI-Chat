"use client"
import React from 'react';

import Upgrade from '@/components/upgradeComponent';

const UpgradePage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-xl rounded p-4 bg-gradient-to-br from-blue-900 to-purple-400">
      <div className="max-w-md w-full">
        <h1 className="text-2xl text-slate-100 font-bold text-center font-mono  mb-6">Upgrade Your Plan</h1>
        <Upgrade />
      </div>
    </div>
  );
};

export default UpgradePage;
