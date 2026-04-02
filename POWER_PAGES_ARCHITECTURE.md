# IVG B2B Portal: Next.js + Power Pages Architecture

## 1. Project Objective
The overarching objective of this project was to deploy a premium, highly interactive **Next.js Single Page Application (SPA)**—featuring fluid GSAP animations, sophisticated UI design systems, and complex React state management—natively inside a **Microsoft Power Pages / Dataverse** portal environment.

Achieving this required heavy architectural modifications to the standard Next.js compilation step to cleanly bypass Microsoft's native IIS firewall restrictions, routing invariants, and Module Federation collisions.

---

## 2. The Core Engineering Challenges

Attempting to upload a standard Next.js static export (`out/`) into Dataverse Web Files immediately triggers four major cascading failures:

### Challenge 1: The Dataverse `_next` Firewall
Microsoft Dataverse automatically rejects and physically deletes any file or folder upload that begins with an underscore (`_`). Because Next.js fundamentally compiles all its core JavaScript and CSS into an `out/_next/static/` directory, the entire React payload is instantly destroyed by the Dataverse ingestion engine, resulting in a blank site.

### Challenge 2: App Router `document.currentScript` Hydration Crashes
The newly introduced Next.js App Router relies on a strict internal mechanism (`document.currentScript.src`) to dynamically locate its React chunks at runtime. If a developer renames the `_next/` folder to bypass the Dataverse firewall, the App Router loses its absolute path bindings and violently throws invariant React hydration crashes.

### Challenge 3: Power Platform CLI Rendering Bugs
When uploading a massive repository of 90+ Next.js chunks, the `pac pages upload-code-site` terminal command encounters a fatal `.NET ArgumentOutOfRangeException` on Mac/Linux environments because the synchronous ASCII loading bars crash the console stream.

### Challenge 4: React Module Federation Collisions
Power Pages natively runs a global Host Environment injecting `react-dom@16.14.0` out-of-the-box via Webpack 5 Module Federation. 
If your SPA uses Next.js 15 (which heavily forces React 19 bindings), it severely collides with the Power Pages `16.14.0` host container. 
If a developer attempts to use Webpack `config.externals` to delete the local Next.js React bundle and blindly rely on the Power Pages `window.React` object, the Next.js chunks will crash with `Uncaught ReferenceError: React is not defined`. This occurs because Next.js scripts execute in the `<head>` sequentially long before Dataverse injects its React layer at the bottom of the `<body>`.

---

## 3. The Custom Architectural Solutions

We engineered a sequence of bulletproof workarounds to completely neutralize these Microsoft-imposed bottlenecks.

### 3.1. Complete Migration to Next.js Pages Router
Because the App Router is permanently incompatible with renamed directories, we completely purged the `/src/app/` folder and migrated the entire dashboard to the classic `src/pages/` architecture. 
*   **Why it works**: The Pages Router utilizes the internal JSON `__NEXT_DATA__` object to map chunks rather than relying on the physical `document.currentScript.src`. This renders it mathematically immune to file-renaming—it doesn't care if its parent directories are altered.

### 3.2. Advanced Asset Flattening (`fix-next-export.js`)
We built a custom Node.js sanitization script that triggers immediately following `npm run build`. 
*   It forcefully plucks every single `.js` and `.css` file from deep inside `_next/static/...`.
*   It dumps them into the absolute root `out/` folder alongside `index.html`.
*   It rigorously string-replaces all paths, renaming them to a safe `ivg-ext-chunks-*` format. 
*   It performs a deep Regex find-and-replace across `index.html` and the `__NEXT_DATA__` state so the newly bundled HTML confidently points to the sanitized chunks, seamlessly bypassing the Dataverse firewall!

### 3.3. PAC CLI Stream Bypass
To resolve the Dataverse upload terminal crashes, we applied standard Unix stream piping to the `package.json` deploy pipeline:
`"deploy": "... pac pages upload-code-site ... | cat"`
Piping the output directly into `cat` forces the `.NET` PAC CLI to evaluate the environment as a non-interactive shell. This forcefully disables the vulnerable interactive ASCII animations, yielding a 100% stable deployment sequence.

### 3.4. Native Webpack 5 Encapsulation (Resolving Federation)
Rather than fighting Microsoft's 16.14.0 Federation Network or relying on broken `external` shims, we locked the project architecture strictly to **Next.js 14.2.20** and **React 18.3.1**. 
*   Instead of sharing React, we allowed Next.js 14 to natively bundle its own discrete React 18 sandbox.
*   Because Next.js encapsulates its scope inside a unique global closure (`window.webpackChunk_N_E`), it entirely ignores Power Pages' `__webpack_share_scopes__`. 
*   Both React versions now run completely isolated from each other in the browser, bypassing all Module Federation collision warnings without crashing.

### 3.5. Double-rAF React Bootstrapping
Because Power Pages aggressively modifies the raw HTML DOM via server-side Liquid injection, standard React hydration immediately crashes due to DOM mismatches. 
To shield the SPA, we constructed a globally deferred Native React Mounting shield utilizing a `requestAnimationFrame` loop inside `src/pages/_app.tsx`:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  });
}, []);

if (!mounted) return <AppLoader />;
```

This `"Double-rAF"` sequence deliberately stalls the Next.js Client Components from attaching until the Power Pages environment has physically finished processing its Liquid template injections. Once the browser repaints efficiently, React takes full control of the `__next` container effortlessly.

---

## 4. The Final Deployment Pipeline

These custom architectural systems function autonomously via the central deployment pipeline integrated in `package.json`:

```json
"scripts": {
  "deploy": "next build && node fix-next-export.js && pac pages upload-code-site --rootPath ./ --compiledPath ./out --siteName \"IVG B2B Portal\" | cat"
}
```

This single orchestrator command successfully drops Next.js 14 compilation, magically flattens and sanitizes the entire filesystem logic to bypass the native IIS `_next` firewall, isolates React 18 out of the Microsoft Webpack loop, and flawlessly deploys the portal back to Dataverse without crashing!
