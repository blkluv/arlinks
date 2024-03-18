"use client"
import Image from "next/image";
import { useRouter } from 'next/router'
import { Inter } from "next/font/google";
import {State, useHookstate} from "@hookstate/core";
import {PermissionType} from "arconnect";
import Arweave from 'arweave';
import {Fragment, Suspense, useEffect, useRef, useState} from "react";
import {ArweaveWallet} from "@/types/ArweaveWallet";
import {createTransaction, dispatchTransaction} from "@/utils/createTransaction";
import {Tag} from "@/types";
import Account from 'arweave-account';
import { Dialog, Transition } from '@headlessui/react'

const arweave = Arweave.init({
  host: "localhost",
  port: 1984,
  protocol: 'http'
});

const account = new Account({
  cacheIsActivated: true,
  cacheSize: 100,
  cacheTime: 60
});

const PERMISSIONS: PermissionType[] = [
  "ACCESS_ADDRESS", "ACCESS_PUBLIC_KEY", "ACCESS_ALL_ADDRESSES", "SIGN_TRANSACTION",
  "ENCRYPT", "DECRYPT", "SIGNATURE", "ACCESS_ARWEAVE_CONFIG", "DISPATCH"
]
const inter = Inter({ subsets: ["latin"] });


function NewLinkForm({wallet}: {wallet: null|ArweaveWallet}) {
  const [sourceId, setSourceId] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [txId, setTxId] = useState<null|string>(null);
  const [status, setStatus] = useState("");
  if(!wallet) return null;

  const handleCreateNewTransaction = async(
    // {wallet, source, name, onChain}: {wallet: null|ArweaveWallet, source: string, name: string, onChain: boolean}
  ) => {
    const tags: Tag[] = [
      {name: "App-Name", value: "ArTree"},
      {name: "Source", value: sourceId},
      {name: "Title", value: sourceName},
    ]
    const transaction = await createTransaction({arweave, tags})
    const response = await dispatchTransaction({transaction, wallet})
    if(response && response.id){
      setTxId(response.id);
      setStatus(`Successfully saved Tx Id ${sourceId} with title ${sourceName} on chain\nPin Id: ${response.id}`)
      setSourceId("")
      setSourceName("")
    }
  }

  return (
    <div className="relative flex flex-row items-center prose pt-8">
      <div className="w-full"
           // border w-full rounded-md mb-4"
           >
        <p
          className="text-background-contrast rounded-md py-4 text-left px-5 max-sm:pt-6 max-sm:break-word"
        >
          Create new link
        </p>
        <div className="flex flex-col gap-2 bg-neutral-50 rounded-lg p-5">
          <div id="source-id-input" className="flex flex-col">
            <label htmlFor="source-id" className="mt-1.5 mb-1/2 text-sm">
              Source TX
            </label>
            <div className="flex flex-row items-center">
              <input
                id="source-id"
                autoComplete="off"
                spellCheck={false}
                type="text"
                minLength={43}
                maxLength={43}
                value={sourceId}
                onChange={(event => setSourceId(event.target.value))}
                // disabled={state.submitted.value!!}
                className="w-full flex-grow bg-slate-100 outline outline-2 outline-slate-400 focus:outline-4 rounded-md font-light tracking-tighter text-[16px] pl-2 px-2 py-0 mt-1"
                // onBlur={() => {
                //   if(state.collectionCode.value) {
                //     state.globalTags.set(defaultAtomicTags(user.address, state.collectionCode.value))
                //   }
                // }}
                // onKeyDown={event => handleKeyDownEnter(event, ()=>viz.coll.set(false))}
              />
              <div className="flex flex-col w-5">
                {sourceId &&
                  <div className="relative w-5 h-5 ml-3 [&>div]:border-2 [&>div]:border-gray-800 [&>div]:absolute [&>div]:top-0 [&>div]:left-0">
                    {sourceId.length === 43
                      ? <div className="w-full h-full rounded-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-green-500 to-green-800 shadow-[inset_0_0_20px_0_rgb(0_0_0/0.5)]"/>
                      : <div className="w-full h-full rounded-full bg-[radial-gradient(ellipse,_var(--tw-gradient-stops))] from-gray-600 to-gray-800 shadow-[inset_0_0_20px_0_rgb(0_0_0/0.5)]"/>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <div id="source-name-input" className="flex flex-col pr-5">
            <label htmlFor="source-name" className="mt-1.5 mb-1/2 text-sm">
              Name
            </label>
            <input
              id="source-name"
              autoComplete="off"
              spellCheck={true}
              // disabled={state.submitted.value!!}
              className="bg-slate-100 outline outline-2 outline-slate-400 focus:outline-4 rounded-md font-light tracking-tighter text-[16px] pl-2 px-2 py-0 mt-1"
              onChange={(event) => setSourceName(event.target.value)}
              //   if(event.target.value.length <= 300) {
              //     state.collectionDescription.set(event.target.value)
              //   }
              // }}
              // onKeyDown={event => handleKeyDownEnter(event, ()=>viz.coll.set(false))}
              value={sourceName}
            />
          </div>
          <div id="save-status" className="">
            {status}
          </div>
          <div className="">
            <button onClick={() => handleCreateNewTransaction()}>
              Save on-chain
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}


function Avatar({avatarUrl, name, size=16}: {avatarUrl: string|undefined, name?: string, size?: number}) {
  return (
    <div id="Avatar">
      <div className="flex flex-row w-fit max-w-full items-center gap-2">
        <div
          className="not-prose box-content"
          style={{position: "relative", width: size, height: size}}
        >
          <Image
            src={avatarUrl || "https://arweave.net/OrG-ZG2WN3wdcwvpjz1ihPe4MI24QBJUpsJGIdL85wA"}
            // fill
            width={size} height={size}
            quality={100}
            alt={name || ""}
            className="object-cover min-h-full min-w-full aspect-square rounded-full overflow-hidden bg-white"
          />
        </div>

        {name &&
          <p className="grow text-xs sm:text-sm ellipsis-1-lines not-prose">
            {name}
          </p>
        }

      </div>
    </div>
  )
}

function ConnectButton({wallet, state, refresh}: { wallet: ArweaveWallet, state: State<WalletState, any>, refresh: any}) {
  if (!state.ready.value || !wallet) return <button>Loading...</button>

  const handleConnect = async (wallet: ArweaveWallet) => {
    await wallet.connect(PERMISSIONS);
    await refresh(wallet);
  }
  const handleDisconnect = async (wallet: ArweaveWallet) => {
    await wallet.disconnect();
    state.merge({connected: false, address: "", permissions: [], balance: -1})
  }

  const Button = ({connect}: {connect: boolean}) => (
    <div className="">
      <button
        type="button"
        onClick={() => connect ? handleConnect(wallet) : handleDisconnect(wallet)}
        className="rounded-lg bg-[#4285F4] hover:bg-[#4285F4]/90
          focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50
          text-white
          px-2 py-1.5 sm:px-5 sm:py-2.5 inline-flex items-center">
          <span className="flex flex-row items-center gap-2 h-4">
            <svg className="w-4 h-4 fill-current" focusable="false"
                 aria-hidden="true" viewBox="0 0 24 24">
              <path
                d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
              />
            </svg>
            <span className="font-medium text-sm leading-none">
              {connect ? "Connect" : "Disconnect"}
            </span>
          </span>
      </button>
    </div>
  )

  if (state.connected.value) return <Button connect={false} />
  else return <Button connect={true} />
}

function NavBar(props: {wallet: ArweaveWallet, state: State<WalletState, any>, refresh: any}) {
  return (
    <nav className="w-full flex flex-row items-center justify-between p-4">
      <h1 className="text-4xl tracking-tight font-extrabold text-gray-900">ArTree</h1>
      <ConnectButton {...props} />
    </nav>
  )
}

function CustomModal({ isOpen, setIsOpen, title, children }: { isOpen: boolean, setIsOpen: any, title: string, children: any }) {
  const modalOverlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function openModal(value: boolean) {
      const modalCl = modalRef.current?.classList;
      const overlayCl = modalOverlayRef.current;
      if (value) {
        overlayCl?.classList.remove('hidden');
        setTimeout(() => {
          modalCl?.remove('opacity-0');
          modalCl?.remove('scale-150');
        }, 100);
      } else {
        setTimeout(() => {
          modalCl?.add('opacity-0');
          modalCl?.add('scale-150');
        }, 100);
        setTimeout(() => overlayCl?.classList.add('hidden'), 300);
      }
    }
    openModal(isOpen); // Invoke openModal when isOpen changes
  }, [isOpen]);

  return (
    <div
      id="modal_overlay"
      ref={modalOverlayRef}
      style={{zIndex: 100}}
      className={`hidden absolute inset-0 bg-black bg-opacity-30 h-screen overflow-hidden w-full flex justify-center items-start md:items-center pt-10 md:pt-0`}
    >
      {/* modal */}
      <div
        id="modal"
        ref={modalRef}
        className="z-100 opacity-0 relative w-10/12 md:w-1/2 h-1/2 md:h-3/4 bg-white rounded shadow-lg transition-all duration-300"
      >
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button type="button"
                  onClick={() => setIsOpen(false)}
                  className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-hide="authentication-modal">
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        <div className="p-4 md:p-5">
          {children}
          {/*<form className="space-y-4" action="#">*/}
          {/*  <div>*/}
          {/*    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your*/}
          {/*      email</label>*/}
          {/*    <input type="email" name="email" id="email"*/}
          {/*           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"*/}
          {/*           placeholder="name@company.com" required/>*/}
          {/*  </div>*/}
          {/*  <div>*/}
          {/*    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your*/}
          {/*      password</label>*/}
          {/*    <input type="password" name="password" id="password" placeholder="••••••••"*/}
          {/*           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"*/}
          {/*           required/>*/}
          {/*  </div>*/}
          {/*  <div className="flex justify-between">*/}
          {/*    <div className="flex items-start">*/}
          {/*      <div className="flex items-center h-5">*/}
          {/*        <input id="remember" type="checkbox" value=""*/}
          {/*               className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"*/}
          {/*               required/>*/}
          {/*      </div>*/}
          {/*      <label htmlFor="remember" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Remember*/}
          {/*        me</label>*/}
          {/*    </div>*/}
          {/*    <a href="#" className="text-sm text-blue-700 hover:underline dark:text-blue-500">Lost Password?</a>*/}
          {/*  </div>*/}
          {/*  <button type="submit"*/}
          {/*          className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login*/}
          {/*    to your account*/}
          {/*  </button>*/}
          {/*  <div className="text-sm font-medium text-gray-500 dark:text-gray-300">*/}
          {/*    Not registered? <a href="#" className="text-blue-700 hover:underline dark:text-blue-500">Create*/}
          {/*    account</a>*/}
          {/*  </div>*/}
          {/*</form>*/}
        </div>
      </div>
    </div>
  );
}

type WalletState = {
  address: string;
  name: string;
  avatar: string;
  permissions: PermissionType[];
  balance: number;
  connected: boolean;
  ready: boolean;
}

export default function Page() {
  const router = useRouter()
  const slug = (router.query.slug && router.query.slug.length > 0) ? router.query.slug[0] : null;
  const arweaveWalletRef = useRef<null | ArweaveWallet>(null);
  const windowCheck = () => (typeof window !== 'undefined' && typeof window.arweaveWallet !== 'undefined');
  let _window = (typeof window !== 'undefined' && typeof window.arweaveWallet !== 'undefined');
  const [modalOpen, setModalOpen] = useState(false);
  const walletState = useHookstate<WalletState>({
    address: "",
    name: "",
    avatar: "",
    permissions: [] as PermissionType[],
    balance: -1,
    connected: false,
    ready: false,
  })
  const pageState = useHookstate({
    address: "",
    name: "",
    avatar: "",
  })

  useEffect(() => {
    (async () => {
      if (slug && !pageState.address.value) {
        console.log("SLUG RUN")
        if (slug.length === 43 && pageState.address.value !== slug) {
          pageState.address.set(slug);
        } else {
          const accountInfo = (await account.search(slug))?.slice(0, 1)[0];
          if (accountInfo) {
            const addr = accountInfo.addr;
            const avatar = accountInfo?.profile?.avatarURL;
            const name = accountInfo?.profile?.handleName;
            pageState.merge({
              address: addr,
              avatar: avatar,
              name: name,
            })
          }
          console.log(JSON.stringify(accountInfo))
        }
      }
      if (_window && typeof window.arweaveWallet !== 'undefined' && !walletState.ready.value) {
        arweaveWalletRef.current = window.arweaveWallet;
        await refresh(window.arweaveWallet);
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, _window])


  const refresh = async (wallet: null | ArweaveWallet) => {
    if (!wallet) return;
    const permissions = await wallet.getPermissions();
    if (permissions) {
      if (permissions.length > 0) {
        const address = await wallet.getActiveAddress();
        let balance = -1;
        try {
          balance = Number(await arweave.wallets.getBalance(address));
        } catch {
        }
        walletState.merge({
          connected: !!address,
          address: address,
          permissions: permissions,
          balance: balance,
          ready: true
        })
      }
    } else {
      if (walletState.ready.value) walletState.ready.set(false)
    }
  }


  const handleRandomTx = async (wallet: null | ArweaveWallet) => {
    if (!wallet) return;
    const tags: Tag[] = [{name: "App-Name", value: "Random"}, {name: "Title", value: "test"},]
    const transaction = await createTransaction({arweave, tags})
    const result = await dispatchTransaction({transaction, wallet})
    console.log(JSON.stringify(result?.id)) // id, type
  }

  if (!arweaveWalletRef.current) {
    return <div>Loading...</div>;
  }
  return (
    <main
      className={`relative flex min-h-screen flex-col items-center ${inter.className}`}
    >
      {/*<ModalWrapper isOpen={modalOpen} setIsOpen={setModalOpen}>*/}
      {/*  This is a test test test*/}
      {/*</ModalWrapper>*/}
      <CustomModal isOpen={modalOpen} setIsOpen={setModalOpen} title="Add new link">
        <NewLinkForm wallet={arweaveWalletRef.current}/>
      </CustomModal>
      <button onClick={() => setModalOpen(!modalOpen)} className="p-4 bg-sky-600 text-white">Open Modal</button>

      <NavBar wallet={arweaveWalletRef.current} state={walletState} refresh={refresh}/>
      {/*<Suspense fallback={<div>Loading...</div>}>*/}
      <div id="debug" className="hidden">
        <div className="flex flex-col w-full mb-4">
          <h3 className="text-2xl">Wallet State</h3>
          <ul>
            <li><b>Ready</b> {`${walletState.ready.value}`}</li>
            <li><b>Connected</b> {`${walletState.connected.value}`}</li>
            <li><b>Address</b> {`${walletState.address.value}`}</li>
            <li><b>Balance</b> {`${walletState.balance.value}`}</li>
            <li><b>Avatar</b> {`${walletState.avatar.value}`}</li>
            <li><b>Name</b> {`${walletState.name.value}`}</li>
          </ul>
        </div>
        <div className="flex flex-col w-full">
          <h3 className="text-2xl">Page State</h3>
          <ul>
            <li><b>Address</b> {`${pageState.address.value}`}</li>
            <li><b>Avatar</b> {`${pageState.avatar.value}`}</li>
            <li><b>Name</b> {`${pageState.name.value}`}</li>
          </ul>
        </div>
      </div>

      {(pageState.name.value || pageState.address.value) &&
        <Avatar size={100} avatarUrl={pageState.avatar.value} name={pageState.name.value || pageState.address.value}/>
      }
      {/*<section className="w-full max-w-3xl mx-auto bg-white/50 backdrop-blur rounded-lg shadow-lg">*/}
      {/*  <div*/}
      {/*    // className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]"*/}
      {/*  >*/}
      {/*    /!*className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"*!/*/}
      {/*    <NewLinkForm wallet={arweaveWalletRef.current}/>*/}

      {/*    <div className="">*/}
      {/*      <p>Create random tx...</p>*/}
      {/*      <button onClick={() => handleRandomTx(arweaveWalletRef.current)}>New Random TX</button>*/}
      {/*    </div>*/}
      {/*  </div>*/}

      {/*/!*</Suspense>*!/*/}
      {/*</section>*/}
    </main>
  );
}
