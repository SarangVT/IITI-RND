import React, { useState } from "react";
import ProjectList from "../components/Dashboard/ProjectList";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Projects");

  const tabs = ["Projects", "Forms", "Analytics", "Settings"];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Tab Bar */}
      <div className="bg-white border-b shadow-sm flex justify-center px-4">
        <div className="flex gap-2 sm:gap-8 w-full max-w-6xl overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 py-4 text-center font-semibold transition-all duration-200 border-b-2 ${
                activeTab === tab
                  ? "text-blue-600 border-blue-600 bg-blue-50/50"
                  : "text-gray-500 border-transparent hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex justify-center mt-8 px-4 sm:px-6 mb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-6xl p-4 sm:p-8">
          
          {activeTab === "Projects" && (
            <div className="animate-in fade-in duration-300">
              <ProjectList />
            </div>
          )}

          {activeTab === "Forms" && (
            <div className="text-gray-500 text-center py-24 animate-in fade-in">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-semibold text-gray-700">Forms Library</h3>
              <p>Forms section coming soon...</p>
            </div>
          )}

          {activeTab === "Analytics" && (
            <div className="text-gray-500 text-center py-24 animate-in fade-in">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-700">Project Analytics</h3>
              <p>Analytics dashboard under development...</p>
            </div>
          )}

          {activeTab === "Settings" && (
            <div className="text-gray-500 text-center py-24 animate-in fade-in">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="text-lg font-semibold text-gray-700">Account Settings</h3>
              <p>Settings will be available soon...</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}