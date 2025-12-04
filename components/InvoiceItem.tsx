type InvoiceProps = {
  id: string;
  vendor_name: string;
  amount: number;
  date: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
};

export default function InvoiceItem({ 
  id, vendor_name: vendor_name, amount, date, isSelected, onToggle 
}: InvoiceProps) {
  return (
    <div className="border p-4 bg-secondary rounded flex items-center justify-between text-content2 border-border">
      
        <div className="mr-4">
            <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => onToggle(id)}
            className="w-5 h-5 accent-accent cursor-pointer"
            />
        </div>

        <span className="flex-1 px-4 truncate">
            {vendor_name}
        </span>

        <span className="font-bold w-24 text-left">
            ${amount.toFixed(2)}
        </span>

        <span className="text-content2 w-34 text-right whitespace-nowrap">
            {date}
        </span>
      
    </div>
  );
}