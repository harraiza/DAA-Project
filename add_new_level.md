# 🧙‍♂️ How to Add a New Level to Algorithm Quest

This guide will walk you through **every step** required to add a new level to the Algorithm Quest app, ensuring full integration with the UI, progress tracking, and game logic. Follow this process to maintain consistency, scalability, and a bug-free experience.

---

## 1. **Create the Phaser Scene for Your Level**

1. **Create a new file** in `client/src/game/scenes/`:
   - Example: `client/src/game/scenes/MergeSortScene.ts`

2. **Export your scene as a named class**:
   ```ts
   import Phaser from 'phaser';

   export class MergeSortScene extends Phaser.Scene {
     constructor() {
       super('MergeSortScene');
     }
     // ... implement your scene logic here ...
   }
   ```
   - **Name** the class and the scene key consistently (e.g., `MergeSortScene`).
   - Implement all gameplay, UI, and controls for your level.
   - **Expose** the following on the scene instance:
     - `levelData` (set by React, contains metadata)
     - `onGameEnd(score: number, levelId: number)` (callback to report completion)
   - **Call** `onGameEnd` on success:
     ```ts
     if ((this as any).onGameEnd) {
       (this as any).onGameEnd(score, levelId);
     }
     ```

---

## 2. **Add Level Metadata to `LEVELS`**

1. **Open** `client/src/game/levels.ts`.
2. **Import** your new scene at the top:
   ```ts
   import { MergeSortScene } from './scenes/MergeSortScene';
   ```
3. **Add a new entry** to the `LEVELS` array:
   ```ts
   {
     id: 4, // Next available ID
     name: 'Merge Sort',
     title: 'Merge Sort-in-the-dark',
     description: 'Merge enchanted fragments in the shadows. Use Merge Sort to combine and conquer the darkness.',
     algorithm: 'Merge Sort',
     difficulty: 'intermediate', // 'beginner' | 'intermediate' | 'advanced'
     maxScore: 100,
     timeComplexity: 'O(n log n)',
     spaceComplexity: 'O(n)',
     tutorial: 'Use the controls to merge and sort the fragments.',
     objective: 'Sort all fragments using Merge Sort logic to unlock the next level.',
     sceneKey: 'MergeSortScene',
     component: MergeSortScene,
     unlocksAtLevel: 3, // ID of the level required to unlock this one
   },
   ```
   - **Fill out all fields** for consistency and UI integration.
   - **Set `unlocksAtLevel`** to control progression.

---

## 3. **UI and Progress Integration (Automatic)**

- The app uses the `LEVELS` array everywhere (selectors, dashboard, modals, etc.).
- **No manual UI edits are needed** if you follow the above steps.
- The new level will appear in:
  - Home screen level selector
  - Dashboard progress
  - Modal overlays
  - Progress tracking/localStorage

---

## 4. **Ensure Scene-React Communication**

- Your scene **must**:
  - Accept `levelData` (metadata object) via `(this as any).levelData` in `create()`.
  - Call `(this as any).onGameEnd(score, levelId)` when the player completes the level.
- Example:
  ```ts
  // In your scene, on success:
  if ((this as any).onGameEnd) {
    (this as any).onGameEnd(finalScore, this.levelData?.id || 4);
  }
  ```
- This triggers the React handler, which updates progress and shows the completion modal.

---

## 5. **Testing Checklist**

- [ ] **Play through the new level** and ensure:
  - [ ] The level appears in the home screen and dashboard.
  - [ ] The level is locked/unlocked as expected.
  - [ ] Completing the level triggers the modal and updates progress in localStorage.
  - [ ] XP, score, and stats are updated.
  - [ ] The UI (modals, dashboard, etc.) displays the new level correctly.
- [ ] **Check for errors** in the browser console.
- [ ] **Remove all debug logs** before shipping.

---

## 6. **Reference Code Snippets**

### **Scene Export Example**
```ts
// client/src/game/scenes/YourNewScene.ts
import Phaser from 'phaser';
export class YourNewScene extends Phaser.Scene {
  constructor() { super('YourNewScene'); }
  create() {
    // ...
    this.levelData = (this as any).levelData;
  }
  // On success:
  private completeLevel() {
    if ((this as any).onGameEnd) {
      (this as any).onGameEnd(100, this.levelData?.id || 99);
    }
  }
}
```

### **LEVELS Array Entry Example**
```ts
// client/src/game/levels.ts
import { YourNewScene } from './scenes/YourNewScene';
export const LEVELS = [
  // ...existing levels...
  {
    id: 99,
    name: 'Your New Level',
    title: 'Your New Level Title',
    description: 'Describe your level here.',
    algorithm: 'Your Algorithm',
    difficulty: 'advanced',
    maxScore: 100,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    tutorial: 'How to play your level.',
    objective: 'What the player must do.',
    sceneKey: 'YourNewScene',
    component: YourNewScene,
    unlocksAtLevel: 98,
  },
];
```

---

## 7. **Best Practices & Gotchas**

- **Scene Key:** Always match the class name and `sceneKey` string.
- **Export as Named Class:** Use `export class MyScene extends Phaser.Scene {}`.
- **No Default Exports:** Always use named exports for scenes.
- **Callback Reference:** Use `(this as any).onGameEnd`, **not** `this.scene` or `this.onGameEnd` directly.
- **Level ID:** Use the correct `id` in both the scene and the LEVELS array.
- **No Debug Logs:** Remove all `console.log` before committing.
- **Test Unlock Logic:** Set `unlocksAtLevel` to the correct previous level.
- **UI Consistency:** Fill out all metadata fields for a polished UI.
- **Progress:** Progress and XP are handled automatically if you follow this guide.

---

## 8. **Troubleshooting**

- **Modal not appearing or progress not saved?**
  - Check that you call `(this as any).onGameEnd(score, levelId)` in your scene.
  - Ensure the `id` matches your LEVELS entry.
- **Level not showing up?**
  - Confirm your LEVELS entry is correct and imported at the top.
- **Unlock logic not working?**
  - Check `unlocksAtLevel` and completedLevels in localStorage.
- **UI fields missing?**
  - Fill out all fields in your LEVELS entry.

---

## 9. **Final Checklist Before Shipping**

- [ ] Scene file created and exported as a named class
- [ ] Scene imported and added to LEVELS array
- [ ] All LEVELS fields filled out
- [ ] Scene calls `(this as any).onGameEnd(score, levelId)` on success
- [ ] Playtested and progress/XP updates
- [ ] No debug logs remain
- [ ] UI and dashboard show the new level

---

**Congratulations!** You've added a new level to Algorithm Quest the right way. 🪄 