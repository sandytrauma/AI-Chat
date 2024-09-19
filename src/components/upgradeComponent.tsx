import React from "react";
import { Button } from "@/components/ui/button";

const Upgrade: React.FC = () => {
  return (
    <div className="flex flex-col space-y-4 p-4 text-slate-800">
      <div className="bg-gradient-to-r from-purple-300 to-emerald-400 shadow-md rounded-lg p-4">
        <h3 className="text-lg ">Basic Plan</h3>
        <p className="text-sm font-mono">
          Get started with the essential features.
        </p>
        <p className="text-xl font-semibold">$10/month</p>
        <ul className="list-disc pl-5">
          <li>Up to 10 prompts per day</li>
          <li>Access to basic support</li>
        </ul>
        <Button
          className="mt-4 w-full"
          onClick={() => (window.location.href = "/upgrade/basic")}
        >
          Upgrade to Basic
        </Button>
      </div>

      <div className="bg-gradient-to-r from-pink-400 to-red-500 shadow-md rounded-lg p-4">
        <h3 className="text-lg font-bold ">Pro Plan</h3>
        <p className="text-sm font-mono">
          Unlock all features for advanced users.
        </p>
        <p className="text-xl font-semibold">$20/month</p>
        <ul className="list-disc pl-5">
          <li>Unlimited prompts</li>
          <li>Priority support</li>
          <li>Access to advanced features</li>
        </ul>
        <Button
          className="mt-4 w-full"
          onClick={() => (window.location.href = "/upgrade/pro")}
        >
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
};

export default Upgrade;
