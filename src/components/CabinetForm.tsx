import { useState } from 'react'
import { CabinetOpening } from '../types'

interface Props {
  onAddOpening: (opening: CabinetOpening) => void
  onUpdateOpening: (index: number, opening: CabinetOpening) => void
  onDeleteOpening: (index: number) => void
  cabinetOpenings: CabinetOpening[]
}

export default function CabinetForm({ onAddOpening, onUpdateOpening, onDeleteOpening, cabinetOpenings }: Props) {
  const [opening, setOpening] = useState<CabinetOpening>({
    width: 0,
    height: 0,
    overlay: 0,
    quantity: 1
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setOpening({ ...opening, [name]: parseFloat(value) })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddOpening(opening)
    setOpening({ width: 0, height: 0, overlay: 0, quantity: 1 })
  }

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Add Cabinet Opening</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-5 gap-4 mb-4">
        <div>
          <label htmlFor="width" className="block mb-1">Width (inches)</label>
          <input
            type="number"
            id="width"
            name="width"
            value={opening.width}
            onChange={handleChange}
            step="0.125"
            min="0"
            required
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        <div>
          <label htmlFor="height" className="block mb-1">Height (inches)</label>
          <input
            type="number"
            id="height"
            name="height"
            value={opening.height}
            onChange={handleChange}
            step="0.125"
            min="0"
            required
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        <div>
          <label htmlFor="overlay" className="block mb-1">Overlay (inches)</label>
          <input
            type="number"
            id="overlay"
            name="overlay"
            value={opening.overlay}
            onChange={handleChange}
            step="0.125"
            min="0"
            required
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        <div>
          <label htmlFor="quantity" className="block mb-1">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={opening.quantity}
            onChange={handleChange}
            min="1"
            required
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
        </div>
      </form>

      <h3 className="text-lg font-semibold mb-2">Cabinet Openings</h3>
      <ul>
        {cabinetOpenings.map((opening, index) => (
          <li key={index} className="mb-2 p-2 border rounded">
            <div className="flex justify-between items-center">
              <span>
                {opening.width}" x {opening.height}" (Overlay: {opening.overlay}") - Qty: {opening.quantity}
              </span>
              <div>
                <button
                  onClick={() => onDeleteOpening(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    const updatedOpening = { ...opening, overlay: opening.overlay + 0.125 }
                    onUpdateOpening(index, updatedOpening)
                  }}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Increase Overlay
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

