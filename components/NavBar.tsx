import {useEffect, useRef, useState} from "react";
import {ArweaveWallet, WalletState} from "@/types";
import {State} from "@hookstate/core";
import {PermissionType} from "arconnect";


const PERMISSIONS: PermissionType[] = ["ACCESS_ADDRESS", "DISPATCH"]

export interface NavBarProps {
  wallet: ArweaveWallet | null,
  walletState: State<WalletState, {}>,
  refresh: any,
}

export function NavBar({wallet, walletState, refresh}: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = async () => {
    if(!wallet) return;
    await wallet.connect(PERMISSIONS);
    await refresh(wallet);
  }
  const handleDisconnect = async () => {
    if(!wallet) return;
    await wallet.disconnect();
    walletState.merge({connected: false, address: "", permissions: [], balance: -1})
  }

  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function openModal(value: boolean) {
      const menuCl = menuRef.current?.classList;
      if (value) {
        menuCl?.remove('hidden');
        setTimeout(() => {
          menuCl?.remove('opacity-0');
          menuCl?.remove('scale-150');
        }, 100);
      } else {
        setTimeout(() => {
          menuCl?.add('opacity-0');
          menuCl?.add('scale-150');
        }, 100);
        setTimeout(() => menuCl?.add('hidden'), 300);
      }
    }
    openModal(isOpen);
  }, [isOpen]);
  return (
    <nav className="w-full flex flex-row items-center justify-between sm:p-4">
      <a href="/">
        <h1 className="text-2xl sm:text-4xl tracking-tight font-extrabold text-gray-900">
          ArLinks
        </h1>
      </a>
      <div className="flex flex-row">
        {!walletState.connected.value &&
          <button
              type="button"
              disabled={!!wallet}
              onClick={() => handleConnect()}
              className="rounded-lg bg-[#4285F4] hover:bg-[#4285F4]/90
            focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50
            text-white
            px-2 py-1.5 sm:px-5 sm:py-2.5 inline-flex items-center"
          >
            <span className="flex flex-row items-center gap-2 h-4">
              <svg className="w-4 h-4 fill-current" focusable="false"
                   aria-hidden="true" viewBox="0 0 24 24">
                <path
                  d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
                />
              </svg>
              <span className="font-medium text-sm leading-none">
                Connect
              </span>
            </span>
          </button>
        }
        {walletState.connected.value &&
          <div className="relative">
            <button
              id="dropdownMenuIconButton"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg text-gray-900 py-2 inline-flex items-center"
              type="button"
            >
              <svg className="w-5 h-5 mr-2 fill-current" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z"></path>
              </svg>
              <span className="font-medium leading-none">
                Menu
              </span>
            </button>

            <div
              ref={menuRef}
              id="dropdownDots"
              className="absolute right-0 z-10 hidden flex bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
            >
              <ul className="w-full py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownMenuIconButton">
                <li>
                  <a
                    href={`/${walletState.address.value}`}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    My Links
                  </a>
                </li>
                <li>
                  <a href="https://account.arweave.dev/" target="_blank"
                     className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Update
                    Profile</a>
                </li>
                <li>
                  <button onClick={() => handleDisconnect()}
                          className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    Disconnect
                  </button>
                </li>
              </ul>
            </div>
          </div>
        }
      </div>
    </nav>
  )
}


export default NavBar;