import {Modal} from "@/components/Modal";


export interface CreateYourOwnModalProps {
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
}
export function CreateYourOwnModal({isOpen, setIsOpen}: CreateYourOwnModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Create Your Own Page"
      footer={
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Close
          </button>
      }
    >
      <div className="w-full h-full flex flex-col">
        <div id="cyo-modal-body" className="flex-shrink overflow-auto">
          <div className="flex flex-col gap-2 h-full">
            <h3 className="text-lg font-medium text-blue-600 mb-1">
              To create your own links page, simply follow these steps:
            </h3>
            <div className="flex-shrink overflow-auto">
              <ol className="list-decimal marker:text-blue-600 marker:font-black space-y-4 pl-5 [&_li]:pl-2">
                <li>
                  <div className="">
                    Click the <strong>connect</strong> button on the top right of the page to login.<br/>
                    <small>If you do not have an Arweave wallet, you can easily create one with &nbsp;
                      <a href="https://arconnect.io/" target="_blank"><u>ArConnect</u></a></small>
                  </div>
                </li>
                <li>
                  <div className="">
                    Click the <strong>menu</strong> button on the top right of the page and select &quot;My
                    Links&quot;.<br/>
                  </div>
                </li>
                <li>
                  <div className="">
                    Click the <strong>Add Link</strong> button under your name.<br/>
                  </div>
                </li>
                <li>
                  <div className="">
                    Enter a Title such as &quot;Instagram&quot; or &quot;My Blog&quot;, &nbsp;
                    enter an Arweave transaction id or full URL (starting with http), &nbsp;
                    and click <strong>Submit</strong>.
                  </div>
                </li>
                <li>
                  <div className="">
                    <small><i>(Optional)</i></small>&nbsp;
                    <a href="https://account.arweave.dev/" target="_blank"><u>Edit your public Arweave
                      Profile</u></a><br/>
                    <ul className="list-disc text-sm pl-4 space-y-2 [&_li]:pl-2">
                      <li>Add or change your username, to access your page
                        at &quot;{window.location.host}/yourUserName&quot;</li>
                      <li>Add or change your profile picture</li>
                      <li>Write or change your bio</li>
                    </ul>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}


export default CreateYourOwnModal;