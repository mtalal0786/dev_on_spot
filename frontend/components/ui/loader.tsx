"use client";

export const Loader = () => {
  return (
    <div className="flex justify-center items-center space-x-2">
      <div className="animate-spin rounded-full border-4 border-t-4 border-blue-500 w-8 h-8"></div>
      <span>Loading...</span>
    </div>
  );
};
