import { useState } from "react";
import InvoiceUploader from "./InvoiceUploader";
import { PlusSVG } from "./SVG";
import ItemModal from "./ItemModal";

export interface InvoiceItem {
  description: string;
  quantity: string;
  price: string;
  total: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  vendor: string;
  invoiceDate: string;
  items: InvoiceItem[];
}

export const ExtractView = () => {
    const [invoiceNumber, setInvoiceNumber] = useState("")
    const [vendor, setVendor] = useState("")
    const [invoiceDate, setInvoiceDate] = useState("")
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
    const [invoiceImg, setInvoiceImg] = useState("")
    const [openModal, setOpenModal] = useState(false)

    const validateInvoice = () => {
        return invoiceNumber && vendor && invoiceDate && invoiceItems.length != 0 && invoiceImg
    }

    return (
        <div className="w-full h-full p-2 flex space-x-2">
            <div className="h-full w-[55%] border-content2/20 border-2 rounded-md flex flex-col">
                <div className="w-full px-4 py-2">
                    <span className="text-lg">Extracted Invoice Information</span>
                </div>
                <div className="flex flex-col px-4 py-2">
                    <span>Invoice Number</span>
                    <input onChange={(e) => setInvoiceNumber(e.target.value)} value={invoiceNumber} placeholder="Invoice number" className="input w-full border-content border-2 bg-primary text-content2" type="text"></input>
                </div>
                <div className="flex flex-col px-4 py-2">
                    <span>Vendor</span>
                    <input onChange={(e) => setVendor(e.target.value)} value={vendor} placeholder="Vendor" className="input w-full border-content border-2 bg-primary text-content2" type="text"></input>
                </div>
                <div className="flex flex-col px-4 py-2 w-full">
                    <span>Invoice Date</span>
                    <input onChange={(e) => setInvoiceDate(e.target.value)} value={invoiceDate} className="input w-full border-content border-2 bg-primary text-content2" type="date"></input>
                </div>
                <div className="flex flex-col p-4 max-h-[300px] overflow-y-auto">
                    <div className="w-full flex justify-between items-center p-1">
                        <span>Items</span>
                        <PlusSVG className="hover:text-accent hover:cursor-pointer" onClick={()=>setOpenModal(true)}/>
                    </div>
                    <ul className="w-full">
                        <li className="rounded-t-md border-2 border-content py-1 px-3">
                            <div className="grid grid-cols-[2fr_1fr_1fr_1fr]">
                                <span>Description</span>
                                <span>Quantity</span>
                                <span>Price</span>
                                <span>Total</span>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="flex-1 flex justify-end items-end p-4">
                    <button className={`btn rounded-md border-0 ${!validateInvoice() ? "cursor-not-allowed bg-muted": "border-0 hover:bg-accent"}`}>Push to Dashboard</button>
                </div>
            </div>
            <div className="h-full w-[45%] border-content2/30 border-2 border-dotted rounded-md">
                <InvoiceUploader invoiceImg={invoiceImg} setInvoiceImg={setInvoiceImg} setInvoiceNumber={setInvoiceNumber} setVendor={setVendor} setInvoiceDate={setInvoiceDate} setInvoiceItems={setInvoiceItems}/>
            </div>
            {openModal && 
            <ItemModal setShouldOpen={setOpenModal} />
            }
        </div>
    )
}