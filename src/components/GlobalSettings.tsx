import type { GlobalSettings } from '../types';

interface Props {
  settings: GlobalSettings
  onSettingsChange: (settings: GlobalSettings) => void
}

export default function GlobalSettings({ settings, onSettingsChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onSettingsChange({ ...settings, [name]: parseFloat(value) })
  }

  return (
    <div className="mb-4 p-4 border rounded">
      <h2 className="text-xl font-semibold mb-2">Global Settings</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label htmlFor="railWidth" className="block mb-1">Rail Width (inches)</label>
          <input
            type="number"
            id="railWidth"
            name="railWidth"
            value={settings.railWidth}
            onChange={handleChange}
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
            value={settings.stileWidth}
            onChange={handleChange}
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
            value={settings.thickness}
            onChange={handleChange}
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
            value={settings.gapSize}
            onChange={handleChange}
            step="0.0625"
            min="0"
            className="w-full px-2 py-1 border rounded"
          />
        </div>
      </div>
    </div>
  )
}

