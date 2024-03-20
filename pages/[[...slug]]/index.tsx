import { useRouter } from 'next/router'
import { useHookstate } from "@hookstate/core";
import { PermissionType } from "arconnect";
import Arweave from 'arweave';
import { Fragment, useEffect, useRef } from "react";
import {ArweaveWallet, LinksResponse, ModalState, WalletState} from "@/types";
import Account from 'arweave-account';
import type {ArAccount} from 'arweave-account';
import { getTxs } from "@/utils/populateLinks";
import { Avatar, NavBar, AddLinkModal, RemoveLinkModal } from "@/components";
import CreateYourOwnModal from "@/components/CreateYourOwnModal";


const arweave = Arweave.init({
  // host: "localhost",
  // port: 1984,
  // protocol: 'http'
});

const account = new Account({
  cacheIsActivated: true,
  cacheSize: 100,
  cacheTime: 60
});


const defaultWalletState = {
  address: "", name: "", avatar: "", permissions: [] as PermissionType[], balance: -1, connected: false, ready: false
}
const defaultPageState = { address: "", name: "", avatar: "" };
const defaultModalState: ModalState = {
  newLink: {open: false}, removeLink: {open: false, item: {title: "", idx: 0}}, cyo: {open: false}
}

export default function Page() {
  const router = useRouter()
  const slug = (router.query.slug && router.query.slug.length > 0) ? router.query.slug[0] : null;
  const arweaveWalletRef = useRef<null | ArweaveWallet>(null);
  let _window = (typeof window !== 'undefined' && typeof window.arweaveWallet !== 'undefined');
  const modalState = useHookstate(defaultModalState)
  const walletState = useHookstate<WalletState>(defaultWalletState)
  const pageState = useHookstate(defaultPageState)
  // const linksState = useHookstate<LinksResponse>(async() => [])
  const linksState = useHookstate<LinksResponse>([])

  useEffect(() => {
    // async function urlSlugToState() {
    //   if (slug && !pageState.address.value) {
    //     const b64Pattern = /^[A-Za-z0-9\-_]*={0,2}$/;
    //     const slugIsNewTxId: boolean = typeof slug !== 'undefined' && slug.length === 43 && b64Pattern.test(slug);
    //     if (slugIsNewTxId) {
    //       pageState.address.set(slug);
    //       linksState.set(getTxs(slug))
    //     } else {
    //       const accountInfo: ArAccount = (await account.search(slug))?.slice(0, 1)[0];
    //       if (accountInfo) {
    //         const addr = accountInfo.addr;
    //         pageState.merge({ address: addr, avatar: accountInfo?.profile?.avatarURL, name: accountInfo?.profile?.handleName })
    //         linksState.set(getTxs(addr))
    //       }
    //     }
    //   }
    //   if (_window && typeof window.arweaveWallet !== 'undefined' && !walletState.ready.value) {
    //     await refresh(window.arweaveWallet);
    //     arweaveWalletRef.current = window.arweaveWallet;
    //   }
    // }
    // urlSlugToState()
    (async() => {
      if (slug && !pageState.address.value) {
        const b64Pattern = /^[A-Za-z0-9\-_]*={0,2}$/;
        const slugIsNewTxId: boolean = typeof slug !== 'undefined' && slug.length === 43 && b64Pattern.test(slug);
        if (slugIsNewTxId) {
          pageState.address.set(slug);
          const links = await getTxs(slug);
          linksState.set(links)
          // linksState.set(getTxs(slug))
        } else {
          const accountInfo: ArAccount = (await account.search(slug))?.slice(0, 1)[0];
          if (accountInfo) {
            const addr = accountInfo.addr;
            pageState.merge({ address: addr, avatar: accountInfo?.profile?.avatarURL, name: accountInfo?.profile?.handleName })
            linksState.set(getTxs(addr))
          }
        }
      }
      if (_window && typeof window.arweaveWallet !== 'undefined' && !walletState.ready.value) {
        await refresh(window.arweaveWallet);
        arweaveWalletRef.current = window.arweaveWallet;
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, _window])

  const refresh = async (wallet: null | ArweaveWallet) => {
    if (!wallet) return;
    const permissions = await wallet.getPermissions();
    if (permissions && permissions.length > 0) {
      const address = await wallet.getActiveAddress();
      let balance = -1;
      try {
        balance = Number(await arweave.wallets.getBalance(address));
      }
      catch { }
      walletState.merge({
        connected: !!address,
        address: address,
        permissions: permissions,
        balance: balance,
        ready: true
      })
    }
    else if (walletState.ready.value) {
      walletState.ready.set(false)
    }
  }

  // if (!arweaveWalletRef.current) return <div>Loading...</div>;
  if (!pageState.address.value) {
    return (
      <main className="relative flex min-h-screen flex-col justify-center items-center p-4 bg-gray-100 bggrad">
        <h1 className="text-4xl text-gray-600 animate-bounce">Loading...</h1>
      </main>
    )
  }
  return (
    <main className="relative flex min-h-screen flex-col items-center p-4 bg-gray-100 bggrad">
      <AddLinkModal
        wallet={arweaveWalletRef.current}
        // isOpen={JSON.parse(JSON.stringify(modalState.newLink.open.value))}
        isOpen={modalState.newLink.open.value}
        setIsOpen={(b: boolean) => modalState.newLink.open.set(b)}
        linksState={linksState}
        arweave={arweave}
      />
      <RemoveLinkModal
        wallet={arweaveWalletRef.current}
        isOpen={modalState.removeLink.open.value}
        setIsOpen={(b: boolean) => modalState.removeLink.open.set(b)}
        item={modalState.removeLink.item.value}
        linksState={linksState}
        arweave={arweave}
      />
      <CreateYourOwnModal
        isOpen={modalState.cyo.open.value}
        setIsOpen={(b: boolean) => modalState.cyo.open.set(b)}
      />

      <NavBar wallet={arweaveWalletRef.current} walletState={walletState} refresh={refresh}/>

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
      <section className="w-full max-w-2xl mx-auto">
        {(pageState.name.value || pageState.address.value) &&
          <div className="flex flex-col items-center mb-8">
            <Avatar size={96} avatarUrl={pageState.avatar.value}/>
            <h3 className="sm:hidden font-bold text-xl mt-4">
              {[pageState.name.value || pageState.address.value].map((name: string) => {
                if (name.length > 40) return name.slice(0, 11) + "..." + name.slice(-11);
                return name;
              })}
            </h3>
            <h3 className="hidden sm:block font-bold text-xl mt-4">
              {pageState.name.value || pageState.address.value}
            </h3>
          </div>
        }
        {(pageState.address.value && walletState.address.value && pageState.address.value === walletState.address.value) &&
          <div className="flex flex-row justify-center">
            <button
              type="button"
              onClick={() => modalState.newLink.open.set(p => !p)}
              className="rounded-lg bg-[#4285F4] hover:bg-[#4285F4]/90 text-white focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 px-2 py-1.5 sm:px-5 sm:py-2.5 inline-flex items-center"
            >
              <span className="flex flex-row items-center gap-2 h-4">
                <svg className="w-4 h-4 fill-current" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                </svg>
                <span className="font-medium text-sm leading-none">
                  Add link
                </span>
              </span>
            </button>
          </div>
        }

        <div className="mt-8">
          {(!linksState.promised && linksState.value.length > 0) &&
            linksState.value.map((item, idx) => {
              if (!item?.source) return null;
              return (
                <div key={idx} className="group relative flex flex-col w-full">
                  {arweaveWalletRef.current &&
                    <button
                      type="button"
                      onClick={() => {
                        modalState.removeLink.merge(p => ({
                          item: {title: item.title, idx: idx}, open: !p.open
                        }))
                      }}
                      className="absolute place-self-center -top-4 bottom-0 right-2 z-20 transition-all
                    group-hover:scale-110 group-hover:translate-x-3 ease-out
                    end-2.5 text-gray-400 bg-gray-200 hover:bg-gray-300 hover:text-red-700 rounded-lg
                    text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                    >
                      <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                           viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                      </svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                  }
                  <a
                    key={idx} href={item.source} target="_blank"
                    className="block shadow-lg px-11 py-4 bg-white/80 rounded mb-4 transition-transform group-hover:scale-105 ease-out"
                    // onClick={()=>{
                    //   // CALL WEBHOOK ENDPOINT IF PROVIDED BY USER
                    // }}
                  >
                    {item.title}
                  </a>
                </div>
              )
            })
          }
        </div>
      </section>
      {(pageState.address.value !== walletState.address.value || !walletState.connected.value) &&
        <>
          {/*<Modal*/}
          {/*  isOpen={modalState.cyo.open.value}*/}
          {/*  setIsOpen={(b: boolean) => modalState.cyo.open.set(b)}*/}
          {/*  title="Create Your Own Page"*/}
          {/*  footer={*/}
          {/*      <button*/}
          {/*        type="button"*/}
          {/*        onClick={() => modalState.cyo.open.set(false)}*/}
          {/*        className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center"*/}
          {/*      >*/}
          {/*        Close*/}
          {/*      </button>*/}
          {/*  }*/}
          {/*>*/}
          {/*  <div className="w-full h-full flex flex-col">*/}
          {/*    <div id="cyo-modal-body" className="flex-shrink overflow-auto">*/}
          {/*      <div className="flex flex-col gap-2 h-full">*/}
          {/*        <h3 className="text-lg font-medium text-blue-600 mb-1">*/}
          {/*          To create your own links page, simply follow these steps:*/}
          {/*        </h3>*/}
          {/*        <div className="flex-shrink overflow-auto">*/}
          {/*          <ol className="list-decimal marker:text-blue-600 marker:font-black space-y-4 pl-5 [&_li]:pl-2">*/}
          {/*            <li>*/}
          {/*              <div className="">*/}
          {/*                Click the <strong>connect</strong> button on the top right of the page to login.<br/>*/}
          {/*                <small>If you do not have an Arweave wallet, you can easily create one with &nbsp;*/}
          {/*                  <a href="https://arconnect.io/" target="_blank"><u>ArConnect</u></a></small>*/}
          {/*              </div>*/}
          {/*            </li>*/}
          {/*            <li>*/}
          {/*              <div className="">*/}
          {/*                Click the <strong>menu</strong> button on the top right of the page and select &quot;My*/}
          {/*                Links&quot;.<br/>*/}
          {/*              </div>*/}
          {/*            </li>*/}
          {/*            <li>*/}
          {/*              <div className="">*/}
          {/*                Click the <strong>Add Link</strong> button under your name.<br/>*/}
          {/*              </div>*/}
          {/*            </li>*/}
          {/*            <li>*/}
          {/*              <div className="">*/}
          {/*                Enter a Title such as &quot;Instagram&quot; or &quot;My Blog&quot;, &nbsp;*/}
          {/*                enter an Arweave transaction id or full URL (starting with http), &nbsp;*/}
          {/*                and click <strong>Submit</strong>.*/}
          {/*              </div>*/}
          {/*            </li>*/}
          {/*            <li>*/}
          {/*              <div className="">*/}
          {/*                <small><i>(Optional)</i></small>&nbsp;*/}
          {/*                <a href="https://account.arweave.dev/" target="_blank"><u>Edit your public Arweave*/}
          {/*                  Profile</u></a><br/>*/}
          {/*                <ul className="list-disc text-sm pl-4 space-y-2 [&_li]:pl-2">*/}
          {/*                  <li>Add or change your username, to access your page*/}
          {/*                    at &quot;{window.location.host}/yourUserName&quot;</li>*/}
          {/*                  <li>Add or change your profile picture</li>*/}
          {/*                  <li>Write or change your bio</li>*/}
          {/*                </ul>*/}
          {/*              </div>*/}
          {/*            </li>*/}
          {/*          </ol>*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</Modal>*/}
          <section className="my-10">
            <div className="flex flex-col items-center">
              <button
                type="button"
                className="animate-bounce bg-gradient-to-r from-white/95 to-white/90 text-black font-bold rounded-full leading-none py-2 px-4"
                onClick={() => modalState.cyo.open.set(true)}
              >
                <small>Create your own ArLinks</small>
              </button>
            </div>
          </section>
        </>
      }

      <hr className="flex flex-1 h-auto"></hr>

      <footer
        className="w-screen -mb-4 md:-mb-5 px-4 pb-4 pt-16 flex flex-row justify-between items-center bg-gradient-to-t from-stone-200 via-stone-200/75 to-stone-200/0">
        <img src="/permanent-on-arweave_white.png" width={128} height={57} alt="permanent-on-arweave"/>
        <div className="flex flex-col items-end gap-1">
          <a href="https://github.com/scottroot/arlinks" alt="Link to ArLinks GitHub repo" target="_blank">
            <button
              type="button"
              className="text-white font-medium text-sm text-center rounded-lg px-3 py-1.5 flex w-fit items-center bg-[#24292F] hover:bg-[#24292F]/90 transition-colors focus:ring-4 focus:outline-none focus:ring-[#24292F]/50"
            >
              <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                   viewBox="0 0 20 20">
                <path fillRule="evenodd"
                      d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                      clipRule="evenodd"/>
              </svg>
              View on Github
            </button>
          </a>
          <span className="text-xs">
            Deployed with <a href="https://github.com/textury/arkb"><u>arkb</u></a> and stored on <a
            href="https://arweave.org"><u>Arweave</u></a>
          </span>
        </div>
      </footer>
    </main>
  );
}
