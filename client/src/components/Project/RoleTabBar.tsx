import React from "react";
import { FiLock, FiCheckCircle } from "react-icons/fi";

interface RoleTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isStep1Approved: boolean;
  isStep2Approved: boolean;
}

export default function RoleTabBar({ activeTab, setActiveTab, isStep1Approved, isStep2Approved }: RoleTabBarProps) {
  return (
    <div className="flex border-b bg-gray-50">
      <button
        onClick={() => setActiveTab("step1")}
        className={`flex-1 py-3.5 flex items-center justify-center gap-2 font-semibold transition-all ${
          activeTab === "step1"
            ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-[0_-2px_0_0_inset_#2563eb]"
            : "text-gray-500 hover:bg-gray-100"
        }`}
      >
        {isStep1Approved && <FiCheckCircle className="text-green-500" size={18} />}
        Step 1: Selection Committee
      </button>

      <button
        onClick={() => {
          if (isStep1Approved) setActiveTab("step2");
        }}
        disabled={!isStep1Approved}
        className={`flex-1 py-3.5 flex items-center justify-center gap-2 font-semibold transition-all ${
          !isStep1Approved
            ? "text-gray-400 bg-gray-100 cursor-not-allowed opacity-70"
            : activeTab === "step2"
            ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-[0_-2px_0_0_inset_#2563eb]"
            : "text-gray-500 hover:bg-gray-50"
        }`}
      >
        {!isStep1Approved ? (
          <FiLock className="text-gray-400" size={16} />
        ) : (
          isStep2Approved && <FiCheckCircle className="text-green-500" size={18} />
        )}
        Step 2: Vacancy Details
      </button>
    </div>
  );
}