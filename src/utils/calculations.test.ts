import { describe, it, expect } from 'vitest'
import { roundUpTo16th, calculateCutlist } from './calculations'
import { CabinetOpening, GlobalSettings } from '../types'

describe('roundUpTo16th', () => {
  it('rounds up to nearest 1/16th inch', () => {
    expect(roundUpTo16th(1.1)).toBe(1.125) // 1 1/8
    expect(roundUpTo16th(1.5)).toBe(1.5) // exactly 1 1/2
    expect(roundUpTo16th(1.51)).toBe(1.5625) // 1 9/16
    expect(roundUpTo16th(2.001)).toBe(2.0625) // 2 1/16
  })

  it('handles exact 1/16th values', () => {
    expect(roundUpTo16th(0.0625)).toBe(0.0625) // 1/16
    expect(roundUpTo16th(0.125)).toBe(0.125) // 1/8
    expect(roundUpTo16th(0.25)).toBe(0.25) // 1/4
    expect(roundUpTo16th(0.5)).toBe(0.5) // 1/2
  })

  it('handles zero and very small values', () => {
    expect(roundUpTo16th(0)).toBe(0)
    expect(roundUpTo16th(0.001)).toBe(0.0625) // rounds up to 1/16
  })
})

describe('calculateCutlist', () => {
  const defaultGlobalSettings: GlobalSettings = {
    railWidth: 2.5,
    stileWidth: 2.5,
    thickness: 0.75,
    gapSize: 0.125,
    tongueGrooveDepth: 0.375
  }

  describe('Single Door Calculations', () => {
    it('calculates correct dimensions for a basic door with uniform overlay', () => {
      const opening: CabinetOpening = {
        width: 12,
        height: 24,
        overlay: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
        quantity: 1,
        isDoor: true,
        name: 'DOOR1'
      }

      const cutlist = calculateCutlist([opening], defaultGlobalSettings)

      // Find the pieces
      const rails = cutlist.find(item => item.piece === 'Rail')
      const stiles = cutlist.find(item => item.piece === 'Stile')
      const panel = cutlist.find(item => item.piece === 'Panel')

      // Total height = 24 + 0.5 + 0.5 = 25"
      expect(stiles?.length).toBe(25)
      expect(stiles?.quantity).toBe(2)

      // Total width = 12 + 0.5 + 0.5 = 13"
      // Rail width = 13 - (2 * 2.5) + (2 * 0.375) = 13 - 5 + 0.75 = 8.75"
      expect(rails?.length).toBe(8.75)
      expect(rails?.quantity).toBe(2)

      // Panel length = 25 - (2 * 2.5) + (2 * 0.375) = 25 - 5 + 0.75 = 20.75"
      expect(panel?.length).toBe(20.75)
      expect(panel?.width).toBe(8.75)
      expect(panel?.quantity).toBe(1)
    })

    it('calculates dimensions for multiple doors (quantity > 1)', () => {
      const opening: CabinetOpening = {
        width: 24,
        height: 30,
        overlay: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
        quantity: 2,
        isDoor: true,
        name: 'DOOR2'
      }

      const cutlist = calculateCutlist([opening], defaultGlobalSettings)

      const rails = cutlist.find(item => item.piece === 'Rail')
      const stiles = cutlist.find(item => item.piece === 'Stile')

      // Total height = 30 + 0.5 + 0.5 = 31"
      // For doors, stile length = total height (not divided by quantity)
      expect(stiles?.length).toBe(31)
      expect(stiles?.quantity).toBe(4) // 2 stiles per door * 2 doors

      // Total width = 24 + 0.5 + 0.5 = 25"
      // Gap size = (2 - 1) * 0.125 = 0.125"
      // Single door width = (25 - 0.125) / 2 = 12.4375"
      // Rail width = 12.4375 - (2 * 2.5) + (2 * 0.375) = 12.4375 - 5 + 0.75 = 8.1875"
      // Rounded up to 1/16th = 8.1875"
      expect(rails?.length).toBe(8.1875)
      expect(rails?.quantity).toBe(4) // 2 rails per door * 2 doors
    })

    it('handles asymmetric overlays', () => {
      const opening: CabinetOpening = {
        width: 15,
        height: 20,
        overlay: { top: 0.75, bottom: 0.25, left: 0.625, right: 0.375 },
        quantity: 1,
        isDoor: true,
        name: 'DOOR3'
      }

      const cutlist = calculateCutlist([opening], defaultGlobalSettings)

      const stiles = cutlist.find(item => item.piece === 'Stile')
      const rails = cutlist.find(item => item.piece === 'Rail')

      // Total height = 20 + 0.75 + 0.25 = 21"
      expect(stiles?.length).toBe(21)

      // Total width = 15 + 0.625 + 0.375 = 16"
      // Rail width = 16 - (2 * 2.5) + (2 * 0.375) = 16 - 5 + 0.75 = 11.75"
      expect(rails?.length).toBe(11.75)
    })
  })

  describe('Drawer Front Calculations', () => {
    it('calculates correct dimensions for a basic drawer front', () => {
      const opening: CabinetOpening = {
        width: 18,
        height: 6,
        overlay: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
        quantity: 1,
        isDoor: false,
        name: 'DRWR1'
      }

      const cutlist = calculateCutlist([opening], defaultGlobalSettings)

      const rails = cutlist.find(item => item.piece === 'Rail')
      const stiles = cutlist.find(item => item.piece === 'Stile')

      // Total height = 6 + 0.5 + 0.5 = 7"
      // For drawer front, stile length = total height (no gap division since quantity=1)
      expect(stiles?.length).toBe(7)

      // Total width = 18 + 0.5 + 0.5 = 19"
      // For drawer front, rail width = total width - (2 * 2.5) + (2 * 0.375)
      // = 19 - 5 + 0.75 = 14.75"
      expect(rails?.length).toBe(14.75)
    })

    it('calculates dimensions for multiple drawer fronts', () => {
      const opening: CabinetOpening = {
        width: 20,
        height: 12,
        overlay: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
        quantity: 3,
        isDoor: false,
        name: 'DRWR2'
      }

      const cutlist = calculateCutlist([opening], defaultGlobalSettings)

      const stiles = cutlist.find(item => item.piece === 'Stile')
      const rails = cutlist.find(item => item.piece === 'Rail')

      // Total height = 12 + 0.5 + 0.5 = 13"
      // Gap size = (3 - 1) * 0.125 = 0.25"
      // For drawer front, stile length = (13 - 0.25) / 3 = 12.75 / 3 = 4.25"
      expect(stiles?.length).toBe(4.25)
      expect(stiles?.quantity).toBe(6) // 2 stiles * 3 drawers

      // Total width = 20 + 0.5 + 0.5 = 21"
      // For drawer front, rail width uses full total width (not divided)
      // Rail width = 21 - (2 * 2.5) + (2 * 0.375) = 21 - 5 + 0.75 = 16.75"
      expect(rails?.length).toBe(16.75)
      expect(rails?.quantity).toBe(6) // 2 rails * 3 drawers
    })
  })

  describe('Tongue and Groove Depth', () => {
    it('applies tongue/groove depth correctly to rails and panels', () => {
      const customSettings: GlobalSettings = {
        ...defaultGlobalSettings,
        tongueGrooveDepth: 0.5 // Different depth
      }

      const opening: CabinetOpening = {
        width: 10,
        height: 10,
        overlay: { top: 0, bottom: 0, left: 0, right: 0 },
        quantity: 1,
        isDoor: true,
        name: 'DOOR4'
      }

      const cutlist = calculateCutlist([opening], customSettings)

      const rails = cutlist.find(item => item.piece === 'Rail')
      const panel = cutlist.find(item => item.piece === 'Panel')

      // Rail width = 10 - (2 * 2.5) + (2 * 0.5) = 10 - 5 + 1 = 6"
      expect(rails?.length).toBe(6)

      // Panel length = 10 - (2 * 2.5) + (2 * 0.5) = 10 - 5 + 1 = 6"
      expect(panel?.length).toBe(6)
      expect(panel?.width).toBe(6)
    })
  })

  describe('Rounding Behavior', () => {
    it('rounds all dimensions up to nearest 1/16th', () => {
      const opening: CabinetOpening = {
        width: 12.1,
        height: 24.2,
        overlay: { top: 0.3, bottom: 0.3, left: 0.3, right: 0.3 },
        quantity: 1,
        isDoor: true,
        name: 'DOOR5'
      }

      const cutlist = calculateCutlist([opening], defaultGlobalSettings)

      const stiles = cutlist.find(item => item.piece === 'Stile')
      const rails = cutlist.find(item => item.piece === 'Rail')

      // Total height = 24.2 + 0.3 + 0.3 = 24.8, rounds up to 24.8125" (24 13/16)
      expect(stiles?.length).toBe(24.8125)

      // Total width = 12.1 + 0.3 + 0.3 = 12.7, rounds up to 12.75" (12 12/16)
      // Rail = 12.75 - 5 + 0.75 = 8.5"
      expect(rails?.length).toBe(8.5)
    })
  })

  describe('Multiple Openings', () => {
    it('generates cutlist for multiple different openings', () => {
      const openings: CabinetOpening[] = [
        {
          width: 12,
          height: 24,
          overlay: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
          quantity: 1,
          isDoor: true,
          name: 'DOOR1'
        },
        {
          width: 18,
          height: 6,
          overlay: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
          quantity: 2,
          isDoor: false,
          name: 'DRWR1'
        }
      ]

      const cutlist = calculateCutlist(openings, defaultGlobalSettings)

      // Should have pieces for both door and drawer
      expect(cutlist.length).toBeGreaterThan(0)

      // Check that we have pieces from both openings
      const doorPieces = cutlist.filter(item => item.name.includes('DOOR1'))
      const drawerPieces = cutlist.filter(item => item.name.includes('DRWR1'))

      expect(doorPieces.length).toBe(3) // rails, stiles, panel
      expect(drawerPieces.length).toBe(3) // rails, stiles, panel
    })
  })

  describe('Edge Cases', () => {
    it('handles zero overlay', () => {
      const opening: CabinetOpening = {
        width: 15,
        height: 20,
        overlay: { top: 0, bottom: 0, left: 0, right: 0 },
        quantity: 1,
        isDoor: true,
        name: 'DOOR6'
      }

      const cutlist = calculateCutlist([opening], defaultGlobalSettings)

      expect(cutlist.length).toBeGreaterThan(0)
      const stiles = cutlist.find(item => item.piece === 'Stile')
      expect(stiles?.length).toBe(20)
    })

    it('handles small dimensions', () => {
      const opening: CabinetOpening = {
        width: 8,
        height: 8,
        overlay: { top: 0.125, bottom: 0.125, left: 0.125, right: 0.125 },
        quantity: 1,
        isDoor: true,
        name: 'DOOR7'
      }

      const cutlist = calculateCutlist([opening], defaultGlobalSettings)

      expect(cutlist.length).toBeGreaterThan(0)
      // All dimensions should be positive
      cutlist.forEach(item => {
        expect(item.length).toBeGreaterThan(0)
        expect(item.width).toBeGreaterThan(0)
        expect(item.thickness).toBeGreaterThan(0)
      })
    })
  })

  describe('Material Thickness', () => {
    it('uses the correct thickness from global settings', () => {
      const customSettings: GlobalSettings = {
        ...defaultGlobalSettings,
        thickness: 1.0
      }

      const opening: CabinetOpening = {
        width: 12,
        height: 24,
        overlay: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
        quantity: 1,
        isDoor: true,
        name: 'DOOR8'
      }

      const cutlist = calculateCutlist([opening], customSettings)

      cutlist.forEach(item => {
        expect(item.thickness).toBe(1.0)
      })
    })
  })
})
