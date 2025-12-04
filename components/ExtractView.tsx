import { useState } from "react";
import InvoiceUploader from "./InvoiceUploader";
import { PlusSVG } from "./SVG";
import ItemModal from "./ItemModal";
import UpdateItemModal from "./UpdateItemModal";

export interface InvoiceItem {
    itemId: string;
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
  total: string;
}

export const ExtractView = () => {
    const [invoiceNumber, setInvoiceNumber] = useState("")
    const [vendor, setVendor] = useState("")
    const [invoiceDate, setInvoiceDate] = useState("")
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
    const [invoiceImg, setInvoiceImg] = useState("")
    const [total, setTotal] = useState("")
    const [openModal, setOpenModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState<InvoiceItem | null>(null)

    const handleUpdateItem = (item: InvoiceItem) => {
        setInvoiceItems(prev => prev.map(i => i.itemId == item.itemId ? item : i))
        setSelectedItem(null)
    }

    const handleDeleteItem = (itemId: string) => {
        setInvoiceItems(prev => prev.filter(i => i.itemId != itemId))
        setSelectedItem(null)
    }

    const validateInvoice = () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const moneyRegex = /^\d+(\.\d{1,2})?$/;

    return (
        !!invoiceNumber &&
        !!vendor &&
        !!invoiceImg &&
        invoiceItems.length > 0 &&
        dateRegex.test(invoiceDate) &&
        moneyRegex.test(total) &&
        Number(total) > 0
    )};

    const handleAddItem = (item: InvoiceItem) => {
        setInvoiceItems(prev => [...prev, item])
        setOpenModal(false)
    }

    const renderItems = () => {
        return invoiceItems.map(item => (
            <li onClick={() => {
                if(selectedItem?.itemId !== item.itemId){
                    setSelectedItem(item)
                }else{
                    setSelectedItem(null)
                }
            }} key={item.itemId} className="hover:cursor-pointer hover:bg-muted border-2 border-t-0 border-content py-1 px-3">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr]">
                    <span>{item.description}</span>
                    <span>{item.quantity}</span>
                    <span>{item.price}</span>
                    <span>{item.total}</span>
                </div>
            </li>
        ))
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
                <div className="flex flex-col p-4 max-h-[250px] overflow-y-auto">
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
                        {renderItems()}
                    </ul>
                </div>
                <div className="flex flex-col px-4 py-2">
                    <span>Total</span>
                    <input onChange={(e) => setTotal(e.target.value)} value={total} placeholder="Total" className="input w-full border-content border-2 bg-primary text-content2" type="text"></input>
                </div>
                <div className="flex-1 flex justify-end items-end p-4">
                    <button className={`btn rounded-md border-0 ${!validateInvoice() ? "cursor-not-allowed bg-muted": "border-0 hover:bg-accent"}`}>Push to Dashboard</button>
                </div>
            </div>
            <div className="h-full w-[45%] border-content2/30 border-2 border-dotted rounded-md">
                <InvoiceUploader invoiceImg={invoiceImg} setInvoiceImg={setInvoiceImg} setInvoiceNumber={setInvoiceNumber} setVendor={setVendor} setInvoiceDate={setInvoiceDate} setInvoiceItems={setInvoiceItems}/>
            </div>
            {openModal && 
            <ItemModal setShouldOpen={setOpenModal} addItem={handleAddItem} />
            }
            {selectedItem &&
            <UpdateItemModal selectedItem={selectedItem} setSelectedItem={setSelectedItem} updateItem={handleUpdateItem} deleteItem={handleDeleteItem} />
            }
        </div>
    )
}