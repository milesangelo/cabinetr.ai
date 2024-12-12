import { useState } from 'react'
import CutlistTable from './components/Cutlist';
import { CabinetOpening, CutlistItem, GlobalSettings } from './types';


function roundUpTo16th(num: number): number {
  return Math.ceil(num * 16) / 16;
}
export default function CabinetCutlistGenerator() {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    railWidth: 1,
    stileWidth: 1,
    thickness: 0.75,
    gapSize: 0.125,
    tongueGrooveDepth: 0.375
  })
  const [cabinetOpenings, setCabinetOpenings] = useState<CabinetOpening[]>([])
  const [newOpening, setNewOpening] = useState<CabinetOpening>({
    width: 0,
    height: 0,
    overlay: { top: 0, bottom: 0, left: 0, right: 0 },
    quantity: 1,
    isDoor: true,
    name: ''
  })
  const [doorCount, setDoorCount] = useState(0)
  const [drawerCount, setDrawerCount] = useState(0)

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGlobalSettings({ ...globalSettings, [name]: parseFloat(value) })
  }

  const handleOpeningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith('overlay.')) {
      const [, side] = name.split('.')
      setNewOpening({
        ...newOpening,
        overlay: { ...newOpening.overlay, [side]: parseFloat(value) }
      })
    } else if (type === 'checkbox') {
      setNewOpening({ ...newOpening, [name]: checked })
    } else {
      setNewOpening({ ...newOpening, [name]: parseFloat(value) })
    }
  }

  const addCabinetOpening = (e: React.FormEvent) => {
    e.preventDefault()
    const prefix = newOpening.isDoor ? 'DOOR' : 'DRWR'
    const count = newOpening.isDoor ? doorCount + 1 : drawerCount + 1
    const name = `${prefix}${count}`
    
    setCabinetOpenings([...cabinetOpenings, { ...newOpening, name }])
    
    if (newOpening.isDoor) {
      setDoorCount(count)
    } else {
      setDrawerCount(count)
    }

    // Update only the name, keeping other values
    setNewOpening(prev => ({
      ...prev,
      name: ''
    }))
  }

  const clearNewOpening = () => {
    setNewOpening({
      width: 0,
      height: 0,
      overlay: { top: 0, bottom: 0, left: 0, right: 0 },
      quantity: 1,
      isDoor: true,
      name: ''
    })
  }

  const deleteCabinetOpening = (index: number) => {
    const updatedOpenings = cabinetOpenings.filter((_, i) => i !== index)
    setCabinetOpenings(updatedOpenings)
  }

  const calculateCutlist = () => {
    const cutlist = cabinetOpenings.flatMap((opening) => {
      const { width, height, overlay, quantity, isDoor, name } = opening
      const { railWidth, stileWidth, thickness, gapSize, tongueGrooveDepth } = globalSettings

      const totalHeight = roundUpTo16th(height + overlay.top + overlay.bottom);
      const totalWidth = roundUpTo16th(width + overlay.left + overlay.right);
      const totalGapSize = (quantity - 1) * gapSize;

      const stileLength = isDoor
        ? totalHeight
        : roundUpTo16th((totalHeight - totalGapSize) / quantity);

      const singleDoorTotalWidth = (totalWidth - totalGapSize) / quantity;
      const singleDoorRailWidth = singleDoorTotalWidth - (2 * stileWidth) + (2 * tongueGrooveDepth);

      const singleDrawerTotalWidth = totalWidth;
      const singleDrawerRailWidth = singleDrawerTotalWidth - (2 * stileWidth) + (2 * tongueGrooveDepth);

      const railLength = isDoor ? roundUpTo16th(singleDoorRailWidth) : roundUpTo16th(singleDrawerRailWidth);

      const panelLength = roundUpTo16th(stileLength - (2 * stileWidth) + (2 * tongueGrooveDepth));
      const panelWidth = railLength;

      return [
        { piece: 'Rail', length: railLength, width: railWidth, thickness, quantity: quantity * 2, name: `${name}_rails` },
        { piece: 'Stile', length: stileLength, width: stileWidth, thickness, quantity: quantity * 2, name: `${name}_stiles` },
        { piece: 'Panel', length: panelLength, width: panelWidth, thickness, quantity, name: `${name}_panel` }
      ]
    })

    // Combine similar pieces
    const combinedCutlist = cutlist.reduce((acc, item) => {
      const key = `${item.name}-${item.length.toFixed(3)}-${item.width.toFixed(3)}-${item.thickness}`
      if (acc[key]) {
        acc[key].quantity += item.quantity
      } else {
        acc[key] = { ...item }
      }
      return acc
    }, {} as Record<string, { piece: string, length: number, width: number, thickness: number, quantity: number, name: string }>)

    return Object.values(combinedCutlist)
  }

  const cutlist = calculateCutlist()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Cabinet Cutlist Generator</h1>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Global Settings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="railWidth" className="block mb-1">Rail Width (inches)</label>
            <input
              type="number"
              id="railWidth"
              name="railWidth"
              value={globalSettings.railWidth}
              onChange={handleSettingsChange}
              step="0.125"
              min="0"
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div>
            <label htmlFor="stileWidth" className="block mb-1">Stile Width (inches)</label>
            <input
              type="number"
              id="stileWidth"
              name="stileWidth"
              value={globalSettings.stileWidth}
              onChange={handleSettingsChange}
              step="0.125"
              min="0"
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div>
            <label htmlFor="thickness" className="block mb-1">Thickness (inches)</label>
            <input
              type="number"
              id="thickness"
              name="thickness"
              value={globalSettings.thickness}
              onChange={handleSettingsChange}
              step="0.125"
              min="0"
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div>
            <label htmlFor="gapSize" className="block mb-1">Gap Size (inches)</label>
            <input
              type="number"
              id="gapSize"
              name="gapSize"
              value={globalSettings.gapSize}
              onChange={handleSettingsChange}
              step="0.0625"
              min="0"
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div>
            <label htmlFor="tongueGrooveDepth" className="block mb-1">Tongue/Groove Depth (inches)</label>
            <input
              type="number"
              id="tongueGrooveDepth"
              name="tongueGrooveDepth"
              value={globalSettings.tongueGrooveDepth}
              onChange={handleSettingsChange}
              step="0.0625"
              min="0"
              className="w-full px-2 py-1 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Add Cabinet Opening</h2>
        <form onSubmit={addCabinetOpening} className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="width" className="block mb-1">Width (inches)</label>
            <input
              type="number"
              id="width"
              name="width"
              value={newOpening.width}
              onChange={handleOpeningChange}
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
              value={newOpening.height}
              onChange={handleOpeningChange}
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
              value={newOpening.quantity}
              onChange={handleOpeningChange}
              min="1"
              required
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div>
            <label htmlFor="overlay.top" className="block mb-1">Top Overlay (inches)</label>
            <input
              type="number"
              id="overlay.top"
              name="overlay.top"
              value={newOpening.overlay.top}
              onChange={handleOpeningChange}
              step="0.125"
              min="0"
              required
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div>
            <label htmlFor="overlay.bottom" className="block mb-1">Bottom Overlay (inches)</label>
            <input
              type="number"
              id="overlay.bottom"
              name="overlay.bottom"
              value={newOpening.overlay.bottom}
              onChange={handleOpeningChange}
              step="0.125"
              min="0"
              required
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div>
            <label htmlFor="overlay.left" className="block mb-1">Left Overlay (inches)</label>
            <input
              type="number"
              id="overlay.left"
              name="overlay.left"
              value={newOpening.overlay.left}
              onChange={handleOpeningChange}
              step="0.125"
              min="0"
              required
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div>
            <label htmlFor="overlay.right" className="block mb-1">Right Overlay (inches)</label>
            <input
              type="number"
              id="overlay.right"
              name="overlay.right"
              value={newOpening.overlay.right}
              onChange={handleOpeningChange}
              step="0.125"
              min="0"
              required
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDoor"
              name="isDoor"
              checked={newOpening.isDoor}
              onChange={handleOpeningChange}
              className="mr-2"
            />
            <label htmlFor="isDoor">Is Door (divide width by quantity)</label>
          </div>
          <div className="flex items-end gap-2 col-span-2 sm:col-span-3">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Add</button>
            <button type="button" onClick={clearNewOpening} className="px-4 py-2 bg-gray-300 rounded">Clear</button>
          </div>
        </form>

        <h3 className="text-lg font-semibold mb-2">Cabinet Openings</h3>
        <ul>
          {cabinetOpenings.map((opening, index) => (
            <li key={index} className="mb-2 p-2 border rounded">
              <div className="flex justify-between items-center">
                <span>
                  {opening.name}: {opening.width}" x {opening.height}" (Overlay: T:{opening.overlay.top}" B:{opening.overlay.bottom}" L:{opening.overlay.left}" R:{opening.overlay.right}") - Qty: {opening.quantity} - {opening.isDoor ? 'Door' : 'Drawer Front'}
                </span>
                <button
                  onClick={() => deleteCabinetOpening(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <CutlistTable cutlist={cutlist} />
    </div>
  )
}

