# Tech Context

## Stack
- **Framework**: React 19 + TypeScript 5
- **Build Tool**: Vite 8
- **Canvas**: Konva 10 + react-konva 19
- **State**: Zustand 5
- **Utilities**: uuid, clsx
- **Dev**: ESLint, TypeScript, Vite HMR

## Rationale
- Konva provides high-performance canvas rendering with a declarative React API, hit detection, transforms, and layering out of the box.
- Zustand is lightweight and avoids boilerplate for global editor state.
- Vite offers fast HMR and simple config for React + TS.

## Constraints
- MVP is client-side only; no backend or auth.
- Export uses Konva `toDataURL`; SVG/PDF require custom serializers later.
- Large icon libraries will need lazy loading or virtualization in the future.
- Keyboard shortcuts are intentionally scoped to non-input contexts to avoid hijacking text editing.
