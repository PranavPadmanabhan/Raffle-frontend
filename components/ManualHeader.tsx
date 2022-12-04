import React, { useEffect } from "react";
import { useMoralis } from "react-moralis";
const ManualHeader = () => {
  const {
    enableWeb3,
    account,
    isWeb3Enabled,
    Moralis,
    deactivateWeb3,
    isWeb3EnableLoading,
  } = useMoralis();

  useEffect(() => {
    if (isWeb3Enabled) return;
    if (typeof window !== "undefined") {
      if (window.localStorage.getItem("connected")) {
        enableWeb3();
      }
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`account changed to : ${account}`);
      if (account == null) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("connected");
        }
        deactivateWeb3();
      }
    });
  }, []);

  return (
    <div>
      {account ? (
        <div>connected:{account.slice(0, 10)}.. </div>
      ) : (
        <button
          disabled={isWeb3EnableLoading}
          onClick={async () => {
            await enableWeb3();
            if (typeof window !== "undefined") {
              window.localStorage.setItem("connected", "injected");
            }
          }}
        >
          connect
        </button>
      )}
    </div>
  );
};

export default ManualHeader;
