"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // Assuming your Button component is here

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  scanPlan: any | null; // For editing an existing scan plan
}

export function Modal({ isOpen, onClose, onSave, scanPlan }: ModalProps) {
  const [planId, setPlanId] = useState(scanPlan?.planId || "");
  const [name, setName] = useState(scanPlan?.name || "");
  const [frequency, setFrequency] = useState(scanPlan?.frequency || "Weekly");
  const [targetPaths, setTargetPaths] = useState(scanPlan?.targetPaths || ["/"]);
  const [status, setStatus] = useState(scanPlan?.status || "Active");

  // Save data when the user clicks on "Save"
  const handleSave = () => {
    const formData = { planId, name, frequency, targetPaths, status };
    onSave(formData);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {scanPlan ? "Edit Scan Plan" : "Add New Scan Plan"}
            </h2>
            <div className="mb-4">
              <label className="block mb-2">Plan ID</label>
              <input
                type="text"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter Plan ID"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter Scan Plan Name"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Target Paths</label>
              <input
                type="text"
                value={targetPaths.join(", ")}
                onChange={(e) => setTargetPaths(e.target.value.split(", "))}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter Target Paths (comma separated)"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
