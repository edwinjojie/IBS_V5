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
