import React from "react";
import { ConnectButton } from "web3uikit";

function Header() {
  return (
    <div className="w-full h-[10%] border-b-2 border-b-blue-200 flex items-center justify-between px-4 box-border">
      <h1 className="text-[2rem] text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-100 to-blue-700 drop-shadow-3xl font-extrabold">RaFFle</h1>
      <ConnectButton moralisAuth={false} />
    </div>
  );
}

export default Header;
