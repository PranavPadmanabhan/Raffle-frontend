/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { abi, contractAdresses } from "../constants/constants";
import { useMoralis } from "react-moralis";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";
import { Moralis } from "moralis-v1";
import { CgSmileSad } from "react-icons/cg";
import { GiGlassCelebration } from "react-icons/gi";

declare global {
  interface Window {
    ethereum: any;
  }
}

function LotteryEntrance() {
  const {
    chainId: chainHex,
    isWeb3Enabled,
    account,
    web3,
    provider,
  } = useMoralis();
  const dispatch = useNotification();
  const [entranceFee, setEntranceFee] = useState<any>("0");
  const [numOfPlayers, setNumOfPlayers] = useState<any>("0");
  const [recentWinner, setRecentWinner] = useState<string>();
  const [balance, setBalance] = useState<any>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [checkWinner, setCheckWinner] = useState<boolean>(false);
  const chainId = parseInt(chainHex!);
  const getAddress = (chainId: any) => {
    switch (chainId) {
      case 31337:
        return contractAdresses["31337"][contractAdresses["31337"].length - 1];
      case 5:
        if ("5" in contractAdresses) {
          return contractAdresses["5"][contractAdresses["5"].length - 1];
        }
      default:
        return contractAdresses["31337"][contractAdresses["31337"].length - 1];
    }
  };

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: getAddress(chainId),
    functionName: "getEntranceFee",
    params: {},
  });

  const {
    runContractFunction: enterRaffle,
    isFetching,
    isLoading,
    data,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: getAddress(chainId),
    functionName: "enterRaffle",
    msgValue: entranceFee,
    params: {},
  });
  const { runContractFunction: getNumOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: getAddress(chainId),
    functionName: "getNumOfPlayers",
    msgValue: entranceFee,
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: getAddress(chainId),
    functionName: "getRandomWinner",
    msgValue: entranceFee,
    params: {},
  });

  const listenToWinner = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(getAddress(chainId), abi, signer);
      contract.once("WinnerPicked", async () => {
        const players = await contract.getNumOfPlayers();
        setNumOfPlayers(players);
        const bal = await contract.provider.getBalance(contract.address);
        setBalance(bal.toString());
        const recentwinner = await contract.getRandomWinner();
        setRecentWinner(recentwinner?.toString());
        await setCheckWinner(
          account == recentwinner?.toString().toLowerCase() ? true : false
        );
        setShowModal(true);
      });
    }
  };

  const listenEntrance = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(getAddress(chainId), abi, signer);
      contract.on("RaffleEnter", async () => {
        const players = await getNumOfPlayers();
        setNumOfPlayers(players);
        const bal = await contract.provider.getBalance(contract.address);
        setBalance(bal.toString());
      });
    }
  };

  const handleSuccess = async (tx: any) => {
    await tx.wait(1);
    handleNewNotification(tx);
  };

  const handleNewNotification = (tx: any) => {
    dispatch({
      type: "info",
      message: "Transaction Complete",
      title: "Tx Notification",
      position: "bottomR",
    });
  };

  async function updateUI() {
    const players = await getNumOfPlayers();
    setNumOfPlayers(players);

    const recentwinner = await getRecentWinner();
    const fee = await getEntranceFee();
    setEntranceFee(fee!.toString());
    setRecentWinner(recentwinner?.toString());
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(getAddress(chainId), abi, signer);
      const bal = await contract.provider.getBalance(contract.address);
      setBalance(bal.toString());
      setRecentWinner(await contract.getRandomWinner());
      setNumOfPlayers(await contract.getNumOfPlayers());
    }

    // console.log(account);
  }
  // listenToWinner();

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
      // listenEntrance();
      listenToWinner();
      listenEntrance();
    }
    setShowModal(false);
  }, [isWeb3Enabled, account]);

  return (
    <div
      className={`relative w-full h-[90%] flex items-center ${
        account ? "justify-start" : "justify-center"
      } `}
    >
      {getAddress(chainId) && account ? (
        <div className="w-full h-full flex flex-col sm:flex-row items-center sm:items-start justify-start sm:justify-evenly box-border ">
          <div className="w-[90%] sm:w-1/2 h-1/2 sm:h-full flex flex-col items-center justify-start pt-[6%] box-border">
            <h1 className="text-[3rem] text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-100 drop-shadow-3xl font-extrabold max-w-[90%] sm:max-w-[50%]">
              LET'S TRY YOUR LUCK..
            </h1>
            <button
              className="min-w-[40%] max-w-[130px] h-[40px] bg-white border-2 border-blue-300 rounded-md font-medium text-blue-400 my-5 flex items-center justify-center"
              onClick={async () => {
                await enterRaffle({
                  onSuccess: handleSuccess,
                  onError: (error) => console.log(error),
                });
              }}
            >
              {!data && (isLoading || isFetching) ? (
                <div className="w-full h-full flex items-center justify-center">
                  <h1 className="mr-4"> Processing</h1>
                  <div className="animate-spin h-5 w-5 border-t-[2px] rounded-[100%] border-t-blue-500"></div>
                </div>
              ) : (
                "Enter Raffle"
              )}
            </button>
            <h1>
              entrance Fee : {ethers.utils.formatEther(entranceFee)}
              Ethers
            </h1>
          </div>

          <div
            className={`w-[90%] sm:w-1/2 h-1/2 sm:h-full flex flex-col items-center sm:items-start pl-0 sm:pl-[10%] box-border justify-start pt-[1%]`}
          >
            {balance && (
              <h1 className="text-gray-600 text-[1.2rem] self-center sm:self-end mr-0 sm:mr-[5%]">
                Raffle Balance : {ethers.utils.formatUnits(balance, "ether")}{" "}
                ETH
              </h1>
            )}
            <h1 className="text-gray-600 text-[1.2rem] self-center sm:self-end mr-0 sm:mr-[5%] ">
              Total players : {numOfPlayers?.toString()}
            </h1>
            <h1 className="text-green-600 text-center text-[2rem] font-medium mt-[10%] self-center sm:self-end mr-0 sm:mr-[5%] underline">
              Recent Winner
            </h1>
            <h1 className="text-black text-[0.8rem] font-light self-center sm:self-end mr-0 sm:mr-[5%]">
              {account == recentWinner?.toLowerCase() ? (
                <h1 className="text-green-700 text-[2rem] mr-5">You!!</h1>
              ) : (
                recentWinner
              )}
            </h1>
          </div>
        </div>
      ) : (
        <h1 className="self-center">
          {account === null
            ? "Please Connect Wallet"
            : "No Raffle currently running"}
        </h1>
      )}

      {showModal && (
        <div className="absolute z-[100] top-0 left-0 right-0 m-auto bottom-0 w-[40%] h-[50%] bg-white rounded-md shadow-modal border-[1px] border-gray-300 flex flex-col items-center justify-center ">
          {checkWinner ? (
            <>
              <GiGlassCelebration className="text-green-400" size={140} />
              <h1 className="text-[2rem] font-serif font-bold">
                Congratulations..
              </h1>
              <h1 className="text-[1.3rem] text-blue-400">You Won!!! </h1>
              <button
                className="min-w-[40%] max-w-[110px] h-[40px] bg-white border-2 border-blue-300 rounded-md font-medium text-blue-400 my-5 flex items-center justify-center"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </>
          ) : (
            <>
              <CgSmileSad className="text-red-400" size={140} />
              <h1 className="text-[2rem] font-serif font-bold">
                Better Luck Next time
              </h1>
              <button
                className="min-w-[40%] max-w-[110px] h-[40px] bg-white border-2 border-blue-300 rounded-md font-medium text-blue-400 my-5 flex items-center justify-center"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default LotteryEntrance;
