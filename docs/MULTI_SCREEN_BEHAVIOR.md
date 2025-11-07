# Multi-Screen Detailed View Behavior

## 🎯 **Corrected Behavior for Detailed Views**

### **Single Screen Setup (≤1 screen detected)**
- **Behavior**: Detailed views open in **new tab**
- **Method**: Uses `window.open(url, '_blank')` for new tab
- **User Experience**: New tab opens while keeping dashboard visible

### **Multiple Screen Setup (>1 screen detected)**
- **Step 1**: User is prompted to assign screen roles (Primary/Secondary)
- **Step 2**: User selects a layout (Grid/Rows/Columns), total slots, and padding
- **Step 3**: Detailed views open in **new windows** on the secondary screen, positioned into the selected layout slots
- **Method**: Uses `window.open()` with calculated coordinates; attempts `moveTo/resizeTo` as needed; extension honors exact coordinates
- **User Experience**: Multi-screen workflow with predictable placement across multiple popped-out windows

## 🔄 **Flow Diagram**

```
User clicks "Pop Out Detailed View"
         ↓
    Detect screen count
         ↓
┌─────────────────┐    ┌─────────────────┐
│ Single Screen   │    │ Multiple Screens│
│ (≤1 detected)   │    │ (>1 detected)   │
└─────────────────┘    └─────────────────┘
         ↓                                 ↓
    Open in new tab         Check if roles
          ↓                 are assigned
    ✅ Complete             ┌─────────────┐
                           │ Roles       │
                           │ Assigned?   │
                           └─────────────┘
                                    ↓
                           ┌─────────────┐    ┌─────────────┐
                           │ Yes        │    │ No          │
                           └─────────────┘    └─────────────┘
                                    ↓               ↓
                           Open new window    Show role
                           on secondary      assignment
                           screen (slot)     + layout controls
                                    ↓               ↓
                           ✅ Complete       User assigns
                                           roles, then
                                           retries
```

## 🧪 **Testing the Corrected Behavior**

### **Test 1: Single Screen**
1. **Setup**: Connect only one monitor or use single-screen device
2. **Action**: Click "Pop Out Metrics Dashboard"
3. **Expected**: New tab opens with `/detailed/metrics`
4. **Result**: ✅ Detailed view opens in new tab

### **Test 2: Multiple Screens - No Roles Assigned**
1. **Setup**: Connect multiple monitors
2. **Action**: Click "Pop Out Metrics Dashboard" before assigning roles
3. **Expected**: Role assignment modal appears
4. **Result**: ✅ User is prompted to assign screen roles

### **Test 3: Multiple Screens - Roles Assigned & Layout Set**
1. **Setup**: Connect multiple monitors and assign roles
2. **Action**: Choose layout Grid with 4 slots, padding 16. Click "Pop Out Metrics Dashboard"
3. **Expected**: New window opens on secondary screen in slot 0; next pop-out uses slot 1, etc.
4. **Result**: ✅ Detailed views fill slots in order

## 🔧 **Technical Implementation**

### **Single Screen Logic**
```typescript
if (screens.length <= 1) {
  // Single screen detected - open detailed view in new tab
  const url = type === 'flight' ? `/detailed/${id}` : `/detailed/${type}`
  window.open(url, '_blank')  // Open in new tab
  return
}
```

### **Multiple Screen Logic**
```typescript
if (!detailedScreenRole) {
  // Multiple screens but no detailed role assigned
  const event = new CustomEvent('showRoleAssignment', {
    detail: { screens, message: 'Please assign screen roles to use detailed views' }
  })
  window.dispatchEvent(event)
  return
}

// Compute layout rect and open window on secondary screen
await popOutDetailedView(type, id, { layout: 'grid', totalSlots: 4, /* slotIndex optional */ })
```

### **Fallback Logic**
```typescript
// Method 3: Final fallback - check screen count
if (!newWindow || newWindow.closed) {
  if (screens.length <= 1) {
    // Single screen - open new tab as fallback
    newWindow = window.open(url, '_blank')
  } else {
    // Multiple screens - try new tab as last resort (layout intent preserved best-effort)
    newWindow = window.open(url, '_blank')
  }
}
```

## 🐛 **Common Issues & Solutions**

### **Issue 1: Detailed View Still Opens in New Tab on Single Screen**
**Cause**: Screen detection failed or screens array is empty
**Solution**: Check browser console for screen detection logs, use debug panel

### **Issue 2: Role Assignment Modal Doesn't Appear**
**Cause**: Event listener not properly set up
**Solution**: Verify the `useEffect` for event listening is active

### **Issue 3: Windows Open on Wrong Screen**
**Cause**: Incorrect screen coordinates or role assignment
**Solution**: Use debug panel to verify screen detection and role assignment

## 📱 **Browser Compatibility Notes**

- **Chrome 100+**: Full support for all features
- **Edge 100+**: Full support for all features  
- **Firefox**: Limited multi-screen API support
- **Safari**: Limited multi-screen API support

## 🔍 **Debugging Commands**

### **Check Current Screen Count**
```javascript
// In browser console
console.log('Screens detected:', window.screens?.length || 'Not supported')
```

### **Check Screen Roles**
```javascript
// In browser console
// This will show in the debug panel or check localStorage
```

### **Test Detailed View Behavior**
```javascript
// In browser console
// Use the debug panel buttons for testing
```

## ✅ **Verification Checklist**

- [ ] Single screen: Detailed views open in new tab
- [ ] Multiple screens: Role assignment modal appears when needed
- [ ] Layout controls appear and persist preferences
- [ ] Multiple screens with roles: Detailed views open in layout slots in order
- [ ] Fallback behavior works correctly for both scenarios
- [ ] Error handling gracefully degrades based on screen count

---

**Key Point**: The system now correctly distinguishes between single and multiple screen scenarios, providing the appropriate user experience for each case.
