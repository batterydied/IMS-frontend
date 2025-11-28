type InvoiceProps = {
  id: string;
  description: string;
  amount: number;
  date: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
};

export default function InvoiceItem({ 
  id, description, amount, date, isSelected, onToggle 
}: InvoiceProps) {
  return (
    <div className="border p-4 rounded flex items-center justify-between text-white">
      
        <div className="mr-4">
            <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => onToggle(id)}
            className="w-5 h-5 accent-blue-500 cursor-pointer"
            />
        </div>

        <span className="flex-1 px-4 truncate">
            {description}
        </span>

        <span className="font-bold w-24 text-left">
            ${amount.toFixed(2)}
        </span>

        <span className="text-white w-34 text-right whitespace-nowrap">
            {date}
        </span>
      
    </div>
  );
}