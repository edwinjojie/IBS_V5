"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, LayoutDashboard, Eye } from "lucide-react"

interface Screen {
  id: number
  left: number
  top: number
  width: number
  height: number
}

interface RoleAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  screens: Screen[]
  onRoleAssign: (screenId: number, role: 'general' | 'detailed') => void
}

export function RoleAssignmentModal({ isOpen, onClose, screens, onRoleAssign }: RoleAssignmentModalProps) {
  const [assignments, setAssignments] = useState<Record<number, 'general' | 'detailed'>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [layout, setLayout] = useState<'grid' | 'rows' | 'columns'>((typeof window !== 'undefined' ? (localStorage.getItem('ms_layout') as any) : 'grid') || 'grid')
  const [totalSlots, setTotalSlots] = useState<number>(typeof window !== 'undefined' ? parseInt(localStorage.getItem('ms_totalSlots') || '2', 10) : 2)
  const [paddingPx, setPaddingPx] = useState<number>(typeof window !== 'undefined' ? parseInt(localStorage.getItem('ms_paddingPx') || '16', 10) : 16)

  const handleRoleSelect = (screenId: number, role: 'general' | 'detailed') => {
    setAssignments(prev => ({
      ...prev,
      [screenId]: role
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Assign roles for all screens
      for (const [screenId, role] of Object.entries(assignments)) {
        await onRoleAssign(parseInt(screenId), role)
      }
      // Persist layout prefs
      try {
        localStorage.setItem('ms_layout', layout)
        localStorage.setItem('ms_totalSlots', String(totalSlots))
        localStorage.setItem('ms_paddingPx', String(paddingPx))
      } catch {}
      onClose()
    } catch (error) {
      console.error('Failed to assign roles:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isComplete = Object.keys(assignments).length === screens.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Multi-Screen Setup Detected
          </DialogTitle>
          <DialogDescription>
            We detected multiple monitors. Please assign a role to each screen to optimize your workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Layout preferences */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Layout</label>
              <select className="w-full border rounded px-2 py-1 mt-1" value={layout} onChange={(e) => setLayout(e.target.value as any)}>
                <option value="grid">Grid</option>
                <option value="rows">Rows</option>
                <option value="columns">Columns</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Total Slots</label>
              <input className="w-full border rounded px-2 py-1 mt-1" type="number" min={1} max={12} value={totalSlots} onChange={(e) => setTotalSlots(parseInt(e.target.value || '1', 10))} />
            </div>
            <div>
              <label className="text-sm font-medium">Padding (px)</label>
              <input className="w-full border rounded px-2 py-1 mt-1" type="number" min={0} max={64} value={paddingPx} onChange={(e) => setPaddingPx(parseInt(e.target.value || '0', 10))} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {screens.map((screen, index) => (
              <Card key={screen.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Monitor {index + 1}
                  </CardTitle>
                  <CardDescription>
                    {screen.width} × {screen.height} pixels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant={assignments[screen.id] === 'general' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRoleSelect(screen.id, 'general')}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      General Dashboard
                    </Button>
                    <Button
                      variant={assignments[screen.id] === 'detailed' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRoleSelect(screen.id, 'detailed')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Detailed Views
                    </Button>
                  </div>
                  
                  {assignments[screen.id] && (
                    <div className="text-sm text-muted-foreground">
                      Role: <span className="font-medium capitalize">{assignments[screen.id]}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!isComplete || isSubmitting}
            >
              {isSubmitting ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
