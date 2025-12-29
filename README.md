# Xellanix Projection

> **Create, Display, Control.**
> A next-generation web-based presentation application with unlimited customization, advanced screen remapping, and remote control capabilities.

---

## 📖 Overview

**Xellanix Projection** goes beyond typical presentation software. It is designed to project content onto various screen sizes with precision. Whether you need complex animations, specific styling, or output remapping, **Projection** handles it all through a simple yet powerful interface.

### ✨ Key Features

- **🎨 Fully Customizable:** Unlimited styling and animation possibilities for your content.
- **🖥️ Advanced Output:** Screen remapping and multi-resolution support.
- **📱 Remote Control:** Control your presentation from any device via browser.
- **⚡ High Performance:** Built on modern web technologies (Bun).

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **[Bun](https://bun.com/docs/installation#windows)** (Required runtime)
- **[Git](https://git-scm.com/install/windows)**
- **[Cloudflared](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/#windows)** (For remote control tunneling)
- **[Windows Terminal](https://aka.ms/terminal)** (Recommended for best experience on Windows)

---

## 🚀 Getting Started

### 1. Installation

Open your terminal in the project folder and install dependencies:

```bash
bun i
```

### 2. Running the App

You have two modes for running the application:

| Mode            | Command         | Description                                                     |
| :-------------- | :-------------- | :-------------------------------------------------------------- |
| **Development** | `bun run dev`   | Read-write mode. Best for editing content.                      |
| **Production**  | `bun run start` | Read-only mode. Highly optimized performance. _Requires Build._ |

> [!WARNING]
> To run in production mode, you must build the project first.

---

## 📝 Creating Projection Content

Content is defined programmatically for maximum control.

1.  **Location:** Create a new `index.ts` file inside `src/data/__temp/slides`.
2.  **Structure:** Export a constant named `_projections` containing your queue data.

> [!IMPORTANT]
> - **Styling Customization:** Deep style customization is natively supported for **"Text"** and **"Component"** types.
> - **System Core:** If you require custom transitions (other than 'fade' or 'none') or advanced logic for primitive types, you will need to modify the core system files directly.

### Content Structure

```typescript
// src/data/__temp/slides/index.ts

export const _projections: ProjectionMaster[] = [
    {
        title: "My Presentation",
        bg: "/__temp/path/to/background.mp4", // Background for the entire queue
        transition: "fade", // "fade" or "none" (default: none)
        contents: [
            // Your slides go here (see Types below)
        ],
    },
];
```

### Content Types (`ProjectionItem`)

You can define slides using three main types: `Image/Video`, `Text`, or `Component`.

```tsx
// 1. Media (Image or Video)
{
  type: "Image", // or "Video"
  content: "/__temp/path/to/media.jpg", // Store local media in "public/__temp"
  bg: "/__temp/optional-override-bg.mp4" // Optional per-content background
  // name: "Optional name, like a title",
  // group: "Optional group name",
  // transition: "Optional per-content transition"
}

// 2. Text (Stylable)
{
  type: "Text",
  content: "Hello World",
  options: {
    className: "text-4xl font-bold", // Tailwind classes
    style: { color: "red" }          // React CSS properties
  }
  // bg: "/__temp/optional-override-bg.mp4"
  // name: "Optional name, like a title",
  // group: "Optional group name",
  // transition: "Optional per-content transition"
}

// 3. Component (React Node)
{
  type: "Component",
  content: <MyCustomSlide />
  // bg: "/__temp/optional-override-bg.mp4"
  // name: "Optional name, like a title",
  // group: "Optional group name",
  // transition: "Optional per-content transition"
}
```

> [!WARNING]
> If using local media, store them (files) in the `public/__temp` folder. Storing them outside the `public/__temp` folder may cause unexpected behavior.

---

## 📦 Import & Export Workflow

> [!CAUTION]
> Only import files from sources you trust. You assume full responsibility for any consequences.

### 🪟 For Windows Users (Automated)

Use the included **Xellanix Projection Utilities** app located at `windows > utilities > utilities.exe`.

- **Importing:**
    1.  Select **Import** > Choose `.xpr` file.
    2.  Review contents for safety.
    3.  **Process**: Automatically extracts to the correct folders.
    4.  **Build**:
        - Choose **"Build Now"** to automatically prepare the app for production.
        - Choose **"Build Later"** if you prefer to run the manual command (`bun run build`) yourself at a later time.
- **Exporting:**
    1.  Select **Export**.
    2.  Review contents.
    3.  **Process**: Packs your current temp folders into an `.xpr` file.

### 🐧 Non-Windows Users (Manual)

**Importing:**

1.  Extract the `.xpr` (zip) file.
2.  Copy contents of `public` → `Xellanix Projection/public/__temp/`
3.  Copy contents of `data` → `Xellanix Projection/src/data/__temp/`
4.  **Build**: Run `bun run build` manually.

**Exporting:**

1.  Copy files from `public/__temp` to a new folder named `public`.
2.  Copy files from `src/data/__temp` to a new folder named `data`.
3.  Zip both folders and change extension from `.zip` to `.xpr`.

---

## 🎮 Controls & Interface

Access the control view at **[http://localhost:3000](http://localhost:3000)**.

### Interface Overview

- **Sidebar:** Navigation for **Queues** (slide decks) and **Settings**.
- **Preview Section:** Browse and prepare slides without showing them on the main screen.
- **On Screen Section:** Controls what is currently visible to the audience.

### Keyboard Shortcuts

#### General

| Action        | Key / Shortcut | Description                       |
| :------------ | :------------- | :-------------------------------- |
| **Add Queue** | `Shift` + `A`  | Add queue(s) from `.json` file(s) |

#### Navigation

| Action                    | Key / Shortcut    | Scope     |
| :------------------------ | :---------------- | :-------- |
| **Previous Slide**        | `Left`            | On Screen |
| **Next Slide**            | `Right`           | On Screen |
| **Previous Preview Item** | `Shift` + `Left`  | Preview   |
| **Next Preview Item**     | `Shift` + `Right` | Preview   |
| **Jump to Slide #1-9**    | `1` - `9`         | On Screen |
| **Jump to Slide #10**     | `0`               | On Screen |
| **Jump to Group #1-10**   | `Shift` + `0-9`   | On Screen |
| **Select Queue**          | `Up` / `Down`     | Sidebar   |

#### Functions & Overlays

| Action              | Key / Shortcut    | Description                    |
| :------------------ | :---------------- | :----------------------------- |
| **Project**         | `Enter`           | Push Preview content to Screen |
| **Stop Projection** | `Shift` + `Enter` | Stop current session           |
| **Cover Screen**    | `V`               | Apply cover overlay            |
| **Transparent**     | `T`               | Make screen transparent        |
| **Blackout**        | `B`               | Turn screen black              |
| **Clear**           | `C`               | Hide content (keep background) |
| **Live Message**    | `Shift` + `M`     | Show marquee message           |

### Special Functions Details

- **Project:** Moves the content currently selected in _Preview_ to the _On Screen_ view.
- **Stop Projection:** Halts the current projection immediately.
- **Screen Overlays:**
    - **Cover:** Apply cover screen (configurable in Settings).
    - **Transparent:** Useful for OBS/Overlay workflows.
    - **Black:** Standard blackout.
    - **Clear:** Hides the text/component foreground but keeps the video/image background running.
- **Live Message:** Display a scrolling marquee message at the bottom of the screen.

---

## 📡 Remote Control

Control your presentation from a tablet or phone.

1.  Ensure the app is running locally.
2.  Run the tunnel command:
    ```bash
    cloudflared tunnel --url http://localhost:3000
    ```
3.  Use the generated URL on any device to access the control interface.
