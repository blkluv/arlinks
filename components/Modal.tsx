import {useEffect, useRef} from "react";


export interface ModalProps {
  isOpen: boolean,
  setIsOpen: any,
  title: string,
  children: any,
  footer?: any,
  onSubmit?: any,
  onSubmitLabel?: string,
  closeLabel?: string
}

export function Modal({isOpen, setIsOpen, title, children, footer}: ModalProps) {
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
      className="hidden absolute inset-0 bg-black bg-opacity-30 h-dvh overflow-hidden w-full flex justify-center items-center md:items-center 2xl:pt-10 md:pt-0"
    >
      <div
        id="modal"
        ref={modalRef}
        className="flex flex-col opacity-0 relative bg-white rounded shadow-lg transition-all duration-300
        w-10/12 md:w-1/2 h-fit xh-1/2 xmd:h-3/4 max-h-[85vh!important]"
      >
        <div id="modal-header" className="flex shrink-0 items-center justify-between p-4 md:p-5 border-b rounded-t">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button type="button" onClick={() => setIsOpen(false)}
            className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg><span className="sr-only">Close modal</span>
          </button>
        </div>
        <div id="modal-body" className="flex flex-grow w-full h-auto p-4 md:p-5 overflow-auto">
          {children}
        </div>
        {footer &&
          <div id="modal-footer" className="border-t w-full p-4 md:p-5 flex flex-row gap-4 justify-center [&>button]:transition-colors">
            {footer}
          </div>
        }
      </div>
    </div>
  );
}


export default Modal;