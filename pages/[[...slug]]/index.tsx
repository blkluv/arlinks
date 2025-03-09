"use client"
import { useEffect, useRef } from "react";
import { useRouter } from "next/router"
import { useHookstate } from "@hookstate/core";
import { PermissionType } from "arconnect";
import Arweave from "arweave";
import Account, { type ArAccount } from "arweave-account";
import { getTxs } from "@/utils/populateLinks";
import { Avatar, NavBar, AddLinkModal, RemoveLinkModal, CreateYourOwnModal, Footer } from "@/components";
import {ArweaveWallet, LinksResponse, ModalState, WalletState} from "@/types";


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
  const linksState = useHookstate<LinksResponse>([])

  useEffect(() => {
    async function urlSlugToState() {
      if (slug && !pageState.address.value) {
        const b64Pattern = /^[A-Za-z0-9\-_]*={0,2}$/;
        const slugIsNewTxId: boolean = typeof slug !== 'undefined' && slug.length === 43 && b64Pattern.test(slug);
        if (slugIsNewTxId) {
          pageState.address.set(slug);
          const links = await getTxs(slug);
          linksState.set(links)
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
    }
    urlSlugToState()
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

  if (!pageState.address.value) {
    return (
      <main
        className="relative flex w-full min-h-screen flex-col justify-center items-center"
      >
        <div className="landing-body brightness-100 contrast-150 opacity-100"/>
        <div className="landing-top"/>
        <div className="grainy"/>

        <CreateYourOwnModal
          isOpen={modalState.cyo.open.value}
          setIsOpen={(b: boolean) => modalState.cyo.open.set(b)}
        />

        <section className="w-full px-4 pt-4 sm:px-5 sm:pt-5">
          <NavBar wallet={arweaveWalletRef.current} walletState={walletState} refresh={refresh}/>
        </section>

        <section className="max-w-lg sm:max-w-xl grid lg:grid-cols-2 pt-10 place-items-center">
          <div className="mb-10">
            <h1 className="text-center text-5xl lg:text-6xl xl:text-7xl font-bold lg:tracking-tight xl:tracking-tighter whitespace-nowrap">
              Link-in-Bio<br/><span className="text-indigo-800">web3 style</span>
            </h1>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => modalState.cyo.open.set(true)}
                className="hidden lg:inline-flex rounded-lg bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 text-white text-lg px-5 py-2.5 items-center"
              >
                Get Started 🚀
              </button>
            </div>
          </div>
          <div className="flex items-center h-72 lg:h-64 w-[300px] lg:w-[200px] -mt-8 lg:mt-0">
            <img src="/hero-img.png" className="h-96 lg:h-[425px] lg:min-w-fit"/>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => modalState.cyo.open.set(true)}
              className="rounded-lg bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 text-white text-lg px-5 py-2.5 inline-flex items-center lg:hidden"
            >
              Get Started 🚀
            </button>
          </div>
        </section>

        <hr className="my-10"/>

        <section className="max-w-lg sm:max-w-xl grid sm:grid-cols-3 gap-16">
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="mt-1 bg-black rounded-full w-10 h-10 shrink-0">
              <img src="/arweave-183x183.png" className="w-full h-full bg-white rounded-full" />
            </div>
            <h3 className="font-semibold text-2xl">Permanent</h3>
          </div>

          <div className="flex flex-col gap-4 items-center text-center">
            <div className="mt-1 bg-white rounded-full w-10 h-10 p-1 shrink-0 border-[3px] border-black/90">
              <svg className="w-full h-full fill-black/90" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.42 0 2.13.54 2.39 1.4.12.4.45.7.87.7h.3c.66 0 1.13-.65.9-1.27-.42-1.18-1.4-2.16-2.96-2.54V4.5c0-.83-.67-1.5-1.5-1.5S10 3.67 10 4.5v.66c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-1.65 0-2.5-.59-2.83-1.43-.15-.39-.49-.67-.9-.67h-.28c-.67 0-1.14.68-.89 1.3.57 1.39 1.9 2.21 3.4 2.53v.67c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-.65c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-2xl">Free</h3>
          </div>
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="mt-1 bg-white rounded-full w-10 h-10 p-1 shrink-0 border-[3px] border-black/90">
              <svg className="w-full h-full fill-black/90" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M10 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2M6 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m12-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m-4 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m-4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m-4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-2xl">Decentralized</h3>
          </div>
        </section>

        <hr className="my-10"/>

        <section className="wrapper bg-[#292a2b] border-y-1 border-gray-300">
          <div className="blockquote-wrapper">
            <blockquote>
              <h1>
                <span className="text-white">ARvrtise&nbsp; is 🔥.</span>&nbsp;
                It&apos;s been such a game-changer.&nbsp;
                I can easily save and share across platforms like X, Lens, Farcaster...&nbsp;
                Plus, <span className="text-white">the integration with Arweave is top-notch</span>.&nbsp;
                For Arweave TXs and regular URLs - it&apos;s just <span className="text-white">so smooth and effortless</span>.&nbsp;Love it!
              </h1>
              <h4>
                <span>&mdash;
                  <span>Jarlston</span></span>
                <span><em>darthvad3r.ar</em></span>
              </h4>
            </blockquote>
          </div>

        </section>

        <section className="mt-20 mb-10">
          <div id="cyo" className="flex flex-col items-center">
            <button
              type="button"
              className="animate-bounce bg-gradient-to-r from-white/95 to-white/90 text-black text-xl font-bold rounded-full py-2 px-6"
              onClick={() => modalState.cyo.open.set(true)}
            >
              <small>Read how to create your ARvrtise page</small>
            </button>
          </div>
        </section>
        <Footer/>
      </main>
    )
  }
  return (
    <main className="relative flex min-h-screen flex-col items-center p-4 bg-gray-100 bggrad">
      <AddLinkModal
        wallet={arweaveWalletRef.current}
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
            <li>
              <b>Ready</b> {`${walletState.ready.value}`}
            </li>
            <li>
              <b>Connected</b> {`${walletState.connected.value}`}
            </li>
            <li>
              <b>Address</b> {`${walletState.address.value}`}
            </li>
            <li>
              <b>Balance</b> {`${walletState.balance.value}`}
            </li>
            <li>
              <b>Avatar</b> {`${walletState.avatar.value}`}
            </li>
            <li>
              <b>Name</b> {`${walletState.name.value}`}
            </li>
          </ul>
        </div>
        <div className="flex flex-col w-full">
          <h3 className="text-2xl">Page State</h3>
          <ul>
            <li>
              <b>Address</b> {`${pageState.address.value}`}
            </li>
            <li>
              <b>Avatar</b> {`${pageState.avatar.value}`}
            </li>
            <li>
              <b>Name</b> {`${pageState.name.value}`}
            </li>
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
        <section className="my-10">
          <div className="flex flex-col items-center">
            <button
              type="button"
              className="animate-bounce bg-gradient-to-r from-white/95 to-white/90 text-black font-bold rounded-full leading-none py-2 px-4"
              onClick={() => modalState.cyo.open.set(true)}
            >
              <small>Create your own ARvrtise link</small>
            </button>
          </div>
        </section>
      }

      <Footer/>
      {/*<hr className="flex flex-1 h-auto"></hr>*/}

      {/*<footer*/}
      {/*  className="w-screen -mb-4 md:-mb-5 px-4 pb-4 pt-16 flex flex-row justify-between items-center bg-gradient-to-t from-stone-200 via-stone-200/75 to-stone-200/0">*/}
      {/*  <img src="/permanent-on-arweave_white.png" width={128} height={57} alt="permanent-on-arweave"/>*/}
      {/*  <div className="flex flex-col items-end gap-1">*/}
      {/*    <a href="https://github.com/scottroot/arlinks" target="_blank">*/}
      {/*      <button*/}
      {/*        type="button"*/}
      {/*        className="text-white font-medium text-sm text-center rounded-lg px-3 py-1.5 flex w-fit items-center bg-[#24292F] hover:bg-[#24292F]/90 transition-colors focus:ring-4 focus:outline-none focus:ring-[#24292F]/50"*/}
      {/*      >*/}
      {/*        <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"*/}
      {/*             viewBox="0 0 20 20">*/}
      {/*          <path fillRule="evenodd"*/}
      {/*                d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"*/}
      {/*                clipRule="evenodd"/>*/}
      {/*        </svg>*/}
      {/*        View on Github*/}
      {/*      </button>*/}
      {/*    </a>*/}
      {/*    <span className="text-xs">*/}
      {/*      Deployed with <a href="https://luvnft.com"><u>LUV NFT</u></a> and stored on <a*/}
      {/*      href="https://arweave.org"><u>Arweave</u></a>*/}
      {/*    </span>*/}
      {/*  </div>*/}
      {/*</footer>*/}
    </main>
  );
}
