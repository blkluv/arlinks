import {ArweaveWallet, LinksResponse, Tag} from "@/types";
import {State} from "@hookstate/core";
import {useState} from "react";
import {createTransaction, dispatchTransaction} from "@/utils/createTransaction";
import Modal from "@/components/Modal";
import type Arweave from "arweave";


const defaultNewLinkStatusState = {
  submitted: false,
  transaction_id: "",
  sourceId: "",
  sourceTitle: ""
}
const defaultNewLinkSourceIdState = {
  validSource: "",
  type: "" as "url"|"tx"|""
}

export interface AddLinkModalProps {
  wallet: null|ArweaveWallet,
  isOpen: boolean,
  setIsOpen: any,
  linksState: State<LinksResponse, {}>,
  arweave: Arweave,
}

export function AddLinkModal({wallet, isOpen, setIsOpen, linksState, arweave}: AddLinkModalProps) {
  const [sourceId, setSourceId] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [source, setSource] = useState(defaultNewLinkSourceIdState);
  const [status, setStatus] = useState(defaultNewLinkStatusState);

  if(!wallet) return null;

  const handleCreateNewTransaction = async() => {
    const tags: Tag[] = [{name: "App-Name", value: "ArLinks"},
                         {name: "Source",   value: source.validSource},
                         {name: "Title",    value: sourceTitle},]
    const transaction = await createTransaction({ arweave, tags })
    const response = await dispatchTransaction({ transaction, wallet })
    if(response && response.id){
      if(!linksState.promised) {
        linksState.set(p => [{title: sourceTitle, source: source.validSource, timestamp: new Date().getTime()}, ...p]);
      }
      setStatus({submitted: true, transaction_id: response.id, sourceId: source.validSource, sourceTitle: sourceTitle})
      setSourceId("")
      setSourceTitle("")
      setSource(defaultNewLinkSourceIdState)
    }
  }

  const reset = () => {
    setSourceId("");
    setSourceTitle("");
    setStatus(defaultNewLinkStatusState);
    setSource(defaultNewLinkSourceIdState)
  }

  const handleIdChange = (event: any) => {
    const val = event.target.value;
    if(typeof val === 'undefined') return;
    setSourceId(event.target.value);
    const b64Pattern = /^[A-Za-z0-9\-_]*={0,2}$/;
    const isTx = val.length === 43 && b64Pattern.test(val);
    const urlPattern = /^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?$/;
    const isUrl = !isTx && urlPattern.test(val)
    if(isTx) {
      setSource({ validSource: val, type: "tx" })
    }
    else if(isUrl) {
      let validSource = val;
      if(!val.startsWith("http") && !val.startsWith("www")) {
        validSource = `https://${val}`
      }
      setSource({ validSource: validSource, type: "url" })
    }
    else {
      setSource({validSource: "invalid", type: ""})
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Add new link"
      footer={
        <>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {status.submitted ? "Close" : "Cancel"}
          </button>
          <button
            type="button"
            disabled={!status.submitted && (!source.type || !sourceTitle)}
            onClick={status.submitted ? () => reset() : () => handleCreateNewTransaction()}
            className="text-white disabled:bg-blue-800/75 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {status.submitted ? "Reset" : "Submit"}
          </button>
        </>
      }
    >
      <div className="w-full relative flex flex-row items-center">
        <div className="w-full">
          <div className="flex flex-col gap-2">
            {!status.submitted &&
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
                    onChange={(event) => setSourceTitle(event.target.value)}
                    value={sourceTitle}
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
                      // maxLength={43}
                      value={sourceId}
                      onChange={handleIdChange}
                      className="w-full flex-grow bg-slate-100 outline outline-2 outline-slate-400 focus:outline-4 rounded-md font-light tracking-tighter text-[16px] pl-2 px-2 py-1 mt-1"
                    />
                  </div>
                  <div id="input-validation-display" className="pt-1">
                    {source.validSource === "invalid" && <span className="block text-gray-600 font-medium text-sm">invalid</span>}
                    {source.type === "tx" && <span className="block text-green-600 font-medium text-sm">valid arweave tx</span>}
                    {source.type === "url" && <span className="flex flex-row gap-2 text-green-600 font-medium text-sm">
                      valid url {source.validSource !== "invalid" && <span className="text-gray-600 font-normal">{source.validSource}</span>}
                    </span>}

                  </div>
                </div>
              </>
            }
            <div id="save-status" className="">
              {status.submitted &&
                <div className="flex flex-col">
                  <p>Successfully saved new link on Arweave<br/><small><a
                    href={`https://viewblock.io/arweave/tx/${status.transaction_id}}`}>{status.transaction_id}</a></small>
                  </p>
                  <br/>
                  <p>What you saved:</p>
                  <ul className="pl-3">
                    <li><b>Title:</b> {status.sourceTitle}</li>
                    <li><b>{source.type === "url" ? "URL" : "TX"}:</b> {source.validSource}</li>
                  </ul>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}


export default AddLinkModal;