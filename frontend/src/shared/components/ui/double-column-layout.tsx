import React from "react";

const DoubleColumnLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="w-full relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="flex flex-col gap-8 justify-center items-center mb-8">
            <img src="/logo.png" alt="" className="w-44 h-44" />
            <h1 className="text-4xl font-bold">FYP CONNECT</h1>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      {children}
    </div>
  );
};

export default DoubleColumnLayout;
