import { memo, useState } from "react"

interface ItemModal {
    setShouldOpen: (state: boolean) => void
}

const ItemModal = ({setShouldOpen}: ItemModal) => {
    const [description, setDescription] = useState("")
    const [quantity, setQuantity] = useState("")
    const [price, setPrice] = useState("")
    const [total, setTotal] = useState("")

    const validateItem = () => {
        const q = Number(quantity)
        const number2Dec = /^\d+(\.\d{1,2})?$/

        return (
            description.trim().length > 0 &&
            Number.isInteger(q) &&
            q > 0 &&
            number2Dec.test(price) &&
            number2Dec.test(total)
        )
        }


    return (
        <div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            onClick={() => setShouldOpen(false)}
        >
            <div
            className="bg-primary w-[500px] h-[500px] rounded-md space-y-2 p-2 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="flex flex-col px-4 py-2">
                <span>Quantity</span>
                <input
                onChange={(e) => setQuantity(e.target.value)}
                value={quantity}
                placeholder="Quantity"
                className="input w-full border-content border-2 bg-primary text-content2"
                type="text"
                />
            </div>
            
            <div className="flex flex-col px-4 py-2">
                <span>Price</span>
                <input
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                placeholder="Price"
                className="input w-full border-content border-2 bg-primary text-content2"
                type="text"
                />
            </div>
            
            <div className="flex flex-col px-4 py-2">
                <span>Total</span>
                <input
                onChange={(e) => setTotal(e.target.value)}
                value={total}
                placeholder="Total"
                className="input w-full border-content border-2 bg-primary text-content2"
                type="text"
                />
            </div>

            <div className="flex flex-col px-4 py-2">
                <span>Description</span>
                <textarea
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                placeholder="Enter description..."
                className="textarea w-full h-28 border-content border-2 bg-primary text-content2 resize-none focus:outline-none"
                />
            </div>

            <div className="flex justify-center items-center">
                <button className={`btn rounded-md border-0 ${!validateItem() && "cursor-not-allowed bg-muted"}`}>Submit</button>
            </div>
        </div>
    </div>
    )
}

export default memo(ItemModal)