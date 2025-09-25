# Audio Device Priority Manager

Enhanced Raycast extension for managing audio devices with priority lists and automatic switching.

## 🎯 Features

### **Priority Management**
- **Interactive device ranking** with visual priority indicators (#1, #2, #3, etc.)
- **Separate input and output priority lists** for independent management
- **Persistent priority storage** that survives device disconnections
- **Full keyboard control** for efficient priority adjustments

### **Automatic Device Switching**
- **Background monitoring** checks for priority device changes every 15 seconds
- **Optional automatic switching** to highest priority available device
- **Immediate switching** when manually setting devices as top priority
- **User-controlled** with clear preference setting

### **Enhanced Device Display**
- **Current device indicators** - green icons and checkmarks show active devices
- **Disconnected device memory** - maintains priority rankings for offline devices
- **Transport type preservation** - remembers device connection types
- **Professional visual design** - clean, intuitive interface

## 🎮 Commands

### **List Devices**
Interactive interface for managing audio device priorities.

**Keyboard Shortcuts:**
- `⌘+T` - Set as Top Priority
- `⌘+↑` - Move Up in Priority
- `⌘+↓` - Move Down in Priority  
- `⌘+B` - Move to Bottom
- `⌘+C` - Copy Device Name
- `⌘+I` - Copy Device ID
- `⌘+U` - Copy Device UID
- `⌘+D` - Show Device Details

### **Priority Monitor**
Background service that automatically switches to priority devices when enabled.

**Features:**
- Runs every 15 seconds in background
- Only switches when "Enable Automatic Priority Switching" is enabled
- Updates command subtitle with current top priority devices
- Energy-efficient using Raycast's native background refresh

### **Set Output Device** (Enhanced)
Original functionality enhanced with priority-aware switching.

### **Set Input Device** (Enhanced)  
Original functionality enhanced with priority-aware switching.

## ⚙️ Settings

### **Enable Automatic Priority Switching**
- **Type**: Checkbox
- **Default**: Disabled
- **Description**: Automatically switch to the highest priority available device when audio devices connect or disconnect

### **Play sound effects through current output** (Original)
- Existing system output preference maintained

### **Favourite Output Device** (Original)
- Existing favourite device preferences maintained

## 🎨 Visual Indicators

### **Device Icons**
- 🟢 **Green**: Currently active device
- ⚪ **Gray**: Available devices
- 🟠 **WiFi Disabled**: Disconnected devices

### **Accessories**
- **✓ Checkmark**: Currently active device
- **#X**: Priority rank (1, 2, 3, etc.)
- **📶 WiFi Disabled**: Disconnected status
- **Device ID**: Technical identifier

### **Status Labels**
- **Connected**: Shows transport type (Bluetooth, USB, Built-in, etc.)
- **Disconnected**: Shows "Transport Type (Disconnected)"

## 🚀 Getting Started

1. **Install the extension** and run "List Devices"
2. **Set device priorities** using keyboard shortcuts or actions
3. **Optionally enable automatic switching** in extension preferences
4. **Connect your devices** and watch automatic priority-based switching

## 💡 Use Cases

### **Home Office Setup**
- Set USB microphone as #1 input priority
- Set studio headphones as #1 output priority
- Enable auto-switching for seamless transitions

### **Mobile Work**
- Set AirPods as #1 for both input and output
- Built-in devices as fallback priorities
- Automatic switching when AirPods connect/disconnect

### **Content Creation**
- Professional microphone as #1 input
- Monitor speakers as #1 output
- Headphones as #2 output for private monitoring

## 🔧 Technical Details

### **Storage**
- Priority lists stored in Raycast's encrypted LocalStorage
- Device information cached for offline device display
- Independent storage for input and output priorities

### **Background Processing**
- Uses Raycast's native background refresh API
- 15-second interval for responsive device detection
- Energy-efficient scheduling optimized by macOS

### **Device Detection**
- Leverages existing `@spotxyz/macos-audio-devices` binary
- Real-time current device status detection
- Smart handling of device connection/disconnection

## 🛠️ Development

### **Build**
```bash
npm run build
```

### **Development**
```bash
npm run dev
```

### **Lint**
```bash
npm run lint
npm run fix-lint
```

## 📄 License

MIT - Same as original audio device extension

## 🙏 Credits

Enhanced by [@bailey.jennings](https://github.com/jenningsb2) based on the original audio device extension by [@benvp](https://github.com/benvp) and contributors.

Original extension: https://github.com/raycast/extensions/tree/main/extensions/audio-device

---

*This extension provides the audio device priority management that many users have requested, making macOS audio device switching effortless and automatic.*