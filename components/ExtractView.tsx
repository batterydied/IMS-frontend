import InvoiceUploader from "./InvoiceUploader";

export const ExtractView = () => {
    return (
        <div className="w-full h-full p-2 flex space-x-2">
            <div className="h-full w-[55%] border-content2/20 border-2 rounded-md flex flex-col">
                <div className="w-full px-4 py-2">
                    <span className="text-lg">Extracted Invoice Information</span>
                </div>
                <div className="flex flex-col px-4 py-2">
                    <span>Invoice Number</span>
                    <input className="input w-full border-content border-2 bg-primary text-content2" type="text"></input>
                </div>
                <div className="flex flex-col px-4 py-2">
                    <span>Vendor</span>
                    <input className="input w-full border-content border-2 bg-primary text-content2" type="text"></input>
                </div>
                <div className="flex justify-between px-4 py-2 w-full">
                    <div className="flex flex-col w-[45%] max-w-[250px]">
                        <span>Invoice Date</span>
                        <input className="input w-full border-content border-2 bg-primary text-content2" type="date"></input>
                    </div>
                    <div className="flex flex-col w-[45%] max-w-[250px]">
                        <span>Due Date</span>
                        <input className="input w-full border-content border-2 bg-primary text-content2" type="date"></input>
                    </div>
                </div>
                <div className="flex flex-col p-4 max-h-[300px] overflow-y-auto">
                    <span>Items</span>
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
                <div className="flex flex-col px-4 py-2">
                    <span>Additional Information</span>
                    <input className="input w-full border-content border-2 bg-primary text-content2" type="text"></input>
                </div>
                <div className="flex-1 flex justify-end items-end p-4">
                    <button className="btn rounded-md">Push to Dashboard</button>
                </div>
            </div>
            <div className="h-full w-[45%] border-content2/30 border-2 border-dotted rounded-md">
                <InvoiceUploader />
            </div>
        </div>
    )
}