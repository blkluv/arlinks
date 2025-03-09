import {State, useHookstate} from "@hookstate/core";
import {createTransaction, dispatchTransaction} from "@/utils/createTransaction";
import Modal from "@/components/Modal";
import {ArweaveWallet, LinksResponse, Tag} from "@/types";
import type Arweave from "arweave";


const defaultState = {
  title: "",
  source: "",
  validSource: "",
  sourceType: "" as "tx"|"url"|"",
  status: { submitted: false, transaction_id: ""}
}

export interface AddLinkModalProps {
  wallet: null|ArweaveWallet,
  isOpen: boolean,
  setIsOpen: any,
  linksState: State<LinksResponse, {}>,
  arweave: Arweave,
}

export function AddLinkModal({wallet, isOpen, setIsOpen, linksState, arweave}: AddLinkModalProps) {
  const state = useHookstate(defaultState)

  if(!wallet) return null;

  const handleCreateNewTransaction = async() => {
    const tags: Tag[] = [{name: "App-Name", value: "ARvrtise"},
                         {name: "Title",    value: state.title.value},
                         {name: "Source",   value: state.validSource.value},]
    const transaction = await createTransaction({ arweave, tags })
    const response = await dispatchTransaction({ transaction, wallet })
    if(response && response.id){
      if(!linksState.promised) {
        linksState.set(p => [
          {title: state.title.value, source: state.validSource.value, timestamp: new Date().getTime()},
          ...p
        ]);
      }
      state.status.merge({submitted: true, transaction_id: response.id})
    }
  }

  const reset = () => state.set(defaultState);

  const handleClose = (b: boolean) => {
    if(!b) {
      reset();
      setIsOpen(b)
    } else {
      setIsOpen(b)
    }
  }

  const handleIdChange = (event: any) => {
    let val = event.target.value;
    if(typeof val === 'undefined') return;
    const b64Pattern = /^[A-Za-z0-9\-_]*={0,2}$/;
    const isTx = val.length === 43 && b64Pattern.test(val);
    const urlPattern = /^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?$/;
    const isUrl = !isTx && urlPattern.test(val)
    if(isTx) {
      state.merge({ source: event.target.value, sourceType: "tx", validSource: val })
    }
    else if(isUrl) {
      if(!val.startsWith("http") && !val.startsWith("www")) {
        val = `https://${val}`
      }
      state.merge({ source: event.target.value, sourceType: "url", validSource: val })
    }
    else {
      state.merge({ source: event.target.value, sourceType: "", validSource: "invalid" })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={(b: boolean) => handleClose(b)}
      title="Add new link"
      footer={
        <>
          <button
            type="button"
            onClick={() => handleClose(false)}
            className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {state.status.submitted.value ? "Close" : "Cancel"}
          </button>
          {state.status.submitted.value
            ? <button
                type="button"
                onClick={() => reset()}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Reset
              </button>
            : <button
                type="button"
                disabled={!state.sourceType.value || !state.title.value}
                onClick={() => handleCreateNewTransaction()}
                className="text-white disabled:bg-blue-800/75 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Submit
              </button>
          }
        </>
      }
    >
      <div className="w-full relative flex flex-row items-center">
        <div className="w-full">
          <div className="flex flex-col gap-2">
            {!state.status.submitted.value &&
              <>
                <div id="source-title-input" className="flex flex-col">
                  <label htmlFor="source-title" className="mt-1.5 mb-1/2 text-sm">
                    Title
                  </label>
                  <input
                    id="source-title"
                    autoComplete="off"
                    spellCheck={true}
                    className="bg-slate-100 outline outline-2 outline-slate-400 focus:outline-4 rounded-md font-light tracking-tighter text-[16px] pl-2 px-2 py-1 mt-1"
                    onChange={(event) => state.title.set(event.target.value)}
                    value={state.title.value}
                  />
                </div>

                <div id="source-id-input" className="flex flex-col">
                  <label htmlFor="source-id" className="mt-1.5 mb-1/2 text-sm">
                    Arweave TX or URL
                  </label>
                  <div className="flex flex-row items-center">
                    <input
                      id="source-id"
                      autoComplete="off"
                      spellCheck={false}
                      type="text"
                      // minLength={0}
                      maxLength={43}
                      value={state.source.value}
                      onChange={handleIdChange}
                      className="w-full flex-grow bg-slate-100 outline outline-2 outline-slate-400 focus:outline-4 rounded-md font-light tracking-tighter text-[16px] pl-2 px-2 py-1 mt-1"
                    />
                  </div>
                  <div id="input-validation-display" className="pt-1">
                    {state.validSource.value === "invalid" && <span className="block text-gray-600 font-medium text-sm">invalid</span>}
                    {state.sourceType.value === "tx" && <span className="block text-green-600 font-medium text-sm">valid arweave tx</span>}
                    {state.sourceType.value === "url" && <span className="flex flex-row gap-2 text-green-600 font-medium text-sm">
                      valid url {state.validSource.value !== "invalid" && <span className="text-gray-600 font-normal">{state.validSource.value}</span>}
                    </span>}

                  </div>
                </div>
              </>
            }
            {state.status.submitted.value &&
              <div id="save-status" className="flex flex-col">
                <p>Successfully saved new link on Arweave<br/><small><a
                  href={`https://viewblock.io/arweave/tx/${state.status.transaction_id.value}}`}>{state.status.transaction_id.value}</a></small>
                </p>
                <br/>
                <p>What you saved:</p>
                <ul className="pl-3">
                  <li><b>Title:</b> {state.title.value}</li>
                  <li><b>{state.sourceType.value === "url" ? "URL" : "TX"}:</b> {state.validSource.value}</li>
                </ul>
              </div>
            }
          </div>
        </div>
      </div>
    </Modal>
  )
}


export default AddLinkModal;