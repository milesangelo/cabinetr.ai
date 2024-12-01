import { CutlistProps } from "../types";

  
  export default function CutlistTable({ cutlist }: CutlistProps) {
    const exportToCsv = () => {
        const headers = ['Name', 'Piece', 'Length (inches)', 'Width (inches)', 'Thickness (inches)', 'Quantity'];
        const csvContent = [
            headers.join(','),
            ...cutlist.map(item => 
                [item.name, item.piece, item.length.toFixed(3), item.width.toFixed(3), item.thickness.toFixed(3), item.quantity].join(',')
            )
        ].join('\n');
    
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cabinet_cutlist.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
  
    return (
        <div className="border rounded p-4">
            <h2 className="text-xl font-semibold mb-2">Cutlist</h2>
            <div className="mb-4">
                <button onClick={exportToCsv} className="px-4 py-2 bg-green-500 text-white rounded">Export to CSV</button>
            </div>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Name</th>
                        <th className="border p-2 text-left">Piece</th>
                        <th className="border p-2 text-left">Length (inches)</th>
                        <th className="border p-2 text-left">Width (inches)</th>
                        <th className="border p-2 text-left">Thickness (inches)</th>
                        <th className="border p-2 text-left">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {cutlist.map((item, index) => (
                        <tr key={index}>
                            <td className="border p-2">{item.name}</td>
                            <td className="border p-2">{item.piece}</td>
                            <td className="border p-2">{item.length.toFixed(3)}</td>
                            <td className="border p-2">{item.width.toFixed(3)}</td>
                            <td className="border p-2">{item.thickness.toFixed(3)}</td>
                            <td className="border p-2">{item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
  }
  
  