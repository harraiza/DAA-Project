import Phaser from 'phaser';

// Structure for each node in the Fibonacci tree
interface FibNode {
    id: string;
    label: string;
    x: number;
    y: number;
    isLeaf: boolean;
    isAccessible: boolean;
    parent: string | null;
    visited: boolean;
    resolved: boolean;
    platform?: Phaser.Physics.Arcade.Image;
    artifact?: Phaser.GameObjects.Sprite;
    value: number;
}

export class FibonacciScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private callStack: Phaser.GameObjects.Text[] = [];
    private callDepthText!: Phaser.GameObjects.Text;
    private startPosition = { x: 600, y: 30 };
    private fibTree: Map<string, FibNode> = new Map();
    private collectedLeaves = 0;
    private totalLeaves = 0;
    private completed = false;
    private fallTimer: number = 0;
    private readonly FALL_RESET_Y = 700;
    private readonly FALL_RESET_TIME = 2000; // ms

    constructor() {
        super('FibonacciScene');
    }

    preload() {
        // All assets are generated with graphics, no external files needed.
    }

    create() {
        // Scene visuals
        this.lights.enable().setAmbientColor(0x333333);
        this.cameras.main.setBackgroundColor('#0f0f2d');

        // Set world bounds larger than camera, and allow movement left of x=0
        this.physics.world.setBounds(-200, 0, 1800, 1000);

        // Data setup
        this.initializeFibTree();
        this.createTextures();
        this.createPlayer();
        this.createPlatformsAndObjects();
        this.createCallStackUI();

        this.cursors = this.input.keyboard!.createCursorKeys();

        // Camera follow and bounds
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(-200, 0, 1800, 1000);

        // Count total leaves
        this.totalLeaves = Array.from(this.fibTree.values()).filter(n => n.isLeaf).length;

        // Initial call stack text
        this.updateCallStack(`Calling fib(5)...`, 0, '#d35400');
        this.callDepthText = this.add.text(20, 20, 'Depth: 5', { fontSize: '20px', color: '#fff' });
    }

    // --- Data Initialization ---
    private initializeFibTree() {
        // Complete fib(5) tree structure
        // Initially accessible: fib(5), fib(4), fib(3-left), fib(2-left), fib(1-leaf)
        
        // Level 0: Root
        this.fibTree.set('fib-5', { id: 'fib-5', label: 'fib(5)', x: 600, y: 100, isLeaf: false, isAccessible: true, parent: null, visited: false, resolved: false, value: -1 });
        
        // Level 1: Children of fib(5)
        this.fibTree.set('fib-4', { id: 'fib-4', label: 'fib(4)', x: 300, y: 220, isLeaf: false, isAccessible: true, parent: 'fib-5', visited: false, resolved: false, value: -1 });
        this.fibTree.set('fib-3-right', { id: 'fib-3-right', label: 'fib(3)', x: 900, y: 220, isLeaf: false, isAccessible: false, parent: 'fib-5', visited: false, resolved: false, value: -1 });
        
        // Level 2: Children of fib(4)
        this.fibTree.set('fib-3-left', { id: 'fib-3-left', label: 'fib(3)', x: 150, y: 340, isLeaf: false, isAccessible: true, parent: 'fib-4', visited: false, resolved: false, value: -1 });
        this.fibTree.set('fib-2-right', { id: 'fib-2-right', label: 'fib(2)', x: 450, y: 340, isLeaf: false, isAccessible: false, parent: 'fib-4', visited: false, resolved: false, value: -1 });
        
        // Level 2: Children of fib(3-right)
        this.fibTree.set('fib-2-right-right', { id: 'fib-2-right-right', label: 'fib(2)', x: 750, y: 340, isLeaf: false, isAccessible: false, parent: 'fib-3-right', visited: false, resolved: false, value: -1 });
        this.fibTree.set('fib-1-right-right', { id: 'fib-1-right-right', label: 'fib(1)', x: 1050, y: 340, isLeaf: true, isAccessible: false, parent: 'fib-3-right', visited: false, resolved: false, value: 1 });
        
        // Level 3: Children of fib(3-left)
        this.fibTree.set('fib-2-left', { id: 'fib-2-left', label: 'fib(2)', x: 0, y: 460, isLeaf: false, isAccessible: true, parent: 'fib-3-left', visited: false, resolved: false, value: -1 });
        this.fibTree.set('fib-1-right', { id: 'fib-1-right', label: 'fib(1)', x: 300, y: 460, isLeaf: true, isAccessible: false, parent: 'fib-3-left', visited: false, resolved: false, value: 1 });
        
        // Level 3: Children of fib(2-right)
        this.fibTree.set('fib-1-right-2', { id: 'fib-1-right-2', label: 'fib(1)', x: 375, y: 460, isLeaf: true, isAccessible: false, parent: 'fib-2-right', visited: false, resolved: false, value: 1 });
        this.fibTree.set('fib-0-right', { id: 'fib-0-right', label: 'fib(0)', x: 525, y: 460, isLeaf: true, isAccessible: false, parent: 'fib-2-right', visited: false, resolved: false, value: 0 });
        
        // Level 3: Children of fib(2-right-right)
        this.fibTree.set('fib-1-right-right-2', { id: 'fib-1-right-right-2', label: 'fib(1)', x: 675, y: 460, isLeaf: true, isAccessible: false, parent: 'fib-2-right-right', visited: false, resolved: false, value: 1 });
        this.fibTree.set('fib-0-right-right', { id: 'fib-0-right-right', label: 'fib(0)', x: 825, y: 460, isLeaf: true, isAccessible: false, parent: 'fib-2-right-right', visited: false, resolved: false, value: 0 });
        
        // Level 4: Children of fib(2-left)
        this.fibTree.set('fib-1-leaf', { id: 'fib-1-leaf', label: 'fib(1)', x: -150, y: 580, isLeaf: true, isAccessible: true, parent: 'fib-2-left', visited: false, resolved: false, value: 1 });
        this.fibTree.set('fib-0-leaf', { id: 'fib-0-leaf', label: 'fib(0)', x: 150, y: 580, isLeaf: true, isAccessible: false, parent: 'fib-2-left', visited: false, resolved: false, value: 0 });
    }

    // --- Texture Generation ---
    private createTextures() {
        this.createStarTexture();
        this.createColorfulPlatformTextures();
    }

    private createColorfulPlatformTextures() {
        // Color palette similar to FactorialScene
        const platformColors = [0x3a86ff, 0x8338ec, 0xff006e, 0xfb5607, 0xffbe0b];
        for (let i = 0; i < platformColors.length; i++) {
            const key = `platform-colorful-${i}`;
            if (!this.textures.exists(key)) {
                const g = this.add.graphics();
                const color = platformColors[i];
                g.fillStyle(color, 1);
                g.fillRect(0, 0, 180, 24);
                g.lineStyle(4, 0xffffff, 0.3);
                g.strokeRect(0, 0, 180, 24);
                // Decorative sparkles/circles
                for (let s = 0; s < 7; s++) {
                    g.fillStyle(0xffffff, 0.5);
                    g.fillCircle(20 + s * 22, 8 + Math.random() * 8, 2 + Math.random() * 2);
                }
                g.generateTexture(key, 180, 24);
                g.destroy();
            }
        }
    }

    private createStarTexture() {
        if (this.textures.exists('magic-star')) return;
        const g = this.add.graphics();
        g.fillStyle(0xffe066, 1);
        drawStar(g, 16, 16, 5, 16, 8);
        g.generateTexture('magic-star', 32, 32);
        g.destroy();
    }

    // --- Platform and Object Creation ---
    private createPlatformsAndObjects() {
        this.revealCurrentPathAndStar();
    }

    // Reveal only the current leftmost path (from root to next unvisited leaf) and show only one star
    private revealCurrentPathAndStar() {
        // Find the current path (root to next unvisited leaf)
        const path = this.getCurrentRecursivePath();
        const pathIds = new Set(path.map(node => node.id));

        // Destroy platforms for all nodes not in the current path
        this.fibTree.forEach(node => {
            if (!pathIds.has(node.id) && node.platform) {
                this.destroyNodeVisuals(node);
            }
        });

        // Set all nodes in the path to accessible, create platforms if needed
        path.forEach((node, idx) => {
            node.isAccessible = true;
            if (!node.visited) {
                if (!node.platform) {
                    this.createPlatformForNode(node);
                    if (node.platform && this.player) {
                        this.physics.add.collider(this.player, node.platform);
                    }
                }
                // Only the last node in the path (the leaf) gets the visible artifact
                if (idx === path.length - 1 && node.isLeaf) {
                    if (!node.artifact && this.player) {
                        node.artifact = this.physics.add.staticSprite(node.x, node.y - 50, 'magic-star');
                        this.physics.add.overlap(this.player, node.artifact, () => this.collectArtifact(node.id), undefined, this);
                    }
                    if (node.artifact) node.artifact.setVisible(true);
                } else if (node.artifact) {
                    node.artifact.setVisible(false);
                }
            } else {
                // If the node is visited, ensure its platform is destroyed
                this.destroyNodeVisuals(node);
            }
        });
    }

    // Get the current recursive path from root to the next unvisited leaf
    private getCurrentRecursivePath(): FibNode[] {
        const path: FibNode[] = [];
        let current = this.fibTree.get('fib-5');
        while (current) {
            path.push(current);
            if (current.isLeaf || current.visited) break;
            // Find the leftmost unvisited child
            const children = this.getChildren(current.id);
            let next: FibNode | undefined = undefined;
            for (const cid of children) {
                const child = this.fibTree.get(cid);
                if (child && !child.visited) {
                    next = child;
                    break;
                }
            }
            if (!next) break;
            current = next;
        }
        return path;
    }

    // --- Accessibility & Thorns ---
    private updateNodeAccessibility(nodeId: string) {
        // No-op: platforms are only shown if accessible
    }

    // --- Player ---
    private createPlayer() {
        if (!this.textures.exists('magic-orb')) {
            const g = this.add.graphics();
            g.fillStyle(0x8e24aa, 0.4);
            g.fillCircle(32, 32, 32);
            g.fillStyle(0x66ccff, 1);
            g.fillCircle(32, 32, 20);
            g.lineStyle(4, 0xffffff, 1);
            g.strokeCircle(32, 32, 20);
            g.generateTexture('magic-orb', 64, 64);
            g.destroy();
        }
        this.player = this.physics.add.sprite(this.startPosition.x, this.startPosition.y, 'magic-orb');
        this.player.setDisplaySize(40, 40);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.player.setPipeline('Light2D');
        this.lights.addLight(this.player.x, this.player.y, 120).setColor(0x66ccff).setIntensity(1.5);
        this.tweens.add({
            targets: this.player.scale,
            x: 1.15,
            y: 1.15,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        // Disable collision with world bounds to remove left/right phantom walls
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(false);
    }

    // --- Artifact Collection & Progression ---
    private collectArtifact(nodeId: string) {
        const node = this.fibTree.get(nodeId);
        if (!node || !node.artifact || node.visited) return;
        node.visited = true;
        node.artifact.destroy();
        node.artifact = undefined;
        this.destroyNodeVisuals(node);
        this.collectedLeaves++;
        this.updateCallStack(`${node.label} returns ${node.value}`, 4, '#28a745');
        // After collecting a leaf, reveal its sibling (right child) and add collider
        if (node.isLeaf && node.parent) {
            const parent = this.fibTree.get(node.parent);
            if (parent) {
                const children = this.getChildren(parent.id);
                const siblingId = children.find(childId => childId !== nodeId);
                if (siblingId) {
                    const sibling = this.fibTree.get(siblingId);
                    if (sibling && !sibling.platform && !sibling.visited) {
                        sibling.isAccessible = true;
                        this.createPlatformForNode(sibling);
                        if (sibling.platform && this.player) {
                            this.physics.add.collider(this.player, sibling.platform);
                        }
                    }
                }
            }
        }
        // Move player to parent platform if it exists
        if (node.parent) {
            const parent = this.fibTree.get(node.parent);
            if (parent) {
                this.tweens.add({
                    targets: this.player,
                    x: parent.x,
                    y: parent.y - 50,
                    duration: 500,
                    ease: 'Sine.InOut',
                    onComplete: () => {
                        this.revealCurrentPathAndStar();
                        this.tryResolveParent(node.parent!);
                        if (this.collectedLeaves === this.totalLeaves && !this.completed) {
                            this.completed = true;
                            this.showCompletion();
                        }
                    }
                });
                return;
            }
        }
        this.revealCurrentPathAndStar();
        this.tryResolveParent(node.parent!);
        if (this.collectedLeaves === this.totalLeaves && !this.completed) {
            this.completed = true;
            this.showCompletion();
        }
    }

    // --- Platform/Thorn/Artifact Cleanup ---
    private destroyNodeVisuals(node: FibNode | undefined) {
        if (!node) return;
        if (node.platform) { node.platform.destroy(); node.platform = undefined; }
        if ((node as any).labelText) { (node as any).labelText.destroy(); (node as any).labelText = undefined; }
        if (node.artifact) { node.artifact.destroy(); node.artifact = undefined; }
    }

    // --- Right Subtree Construction ---
    private tryResolveParent(parentId: string | null) {
        if (!parentId) return;
        const parent = this.fibTree.get(parentId);
        if (!parent) return;
        const children = this.getChildren(parentId);
        if (children.every(id => this.fibTree.get(id)?.visited)) {
            parent.visited = true;
            parent.value = children.reduce((sum, cid) => sum + (this.fibTree.get(cid)?.value ?? 0), 0);
            this.updateCallStack(`${parent.label} returns ${parent.value}`, 3, '#1f618d');
            children.forEach(cid => this.destroyNodeVisuals(this.fibTree.get(cid)!));
            this.destroyNodeVisuals(parent);
            // Special case: if parent is fib-4, reveal right subtree
            if (parent.id === 'fib-4') {
                this.destroyNodeVisuals(parent);
                const fib5 = this.fibTree.get('fib-5');
                if (fib5 && this.player) {
                    this.tweens.add({
                        targets: this.player,
                        x: fib5.x,
                        y: fib5.y - 50,
                        duration: 500,
                        onComplete: () => {
                            // Construct fib-3-right and its leftmost path
                            const rightSiblingId = 'fib-3-right';
                            const rightSibling = this.fibTree.get(rightSiblingId);
                            if (rightSibling && !rightSibling.platform && !rightSibling.visited) {
                                rightSibling.isAccessible = true;
                                this.createPlatformForNode(rightSibling);
                                if (rightSibling.platform && this.player) {
                                    this.physics.add.collider(this.player, rightSibling.platform);
                                }
                                this.createLeftmostPath(rightSibling.id);
                            }
                            this.revealCurrentPathAndStar();
                            if (fib5.parent) this.tryResolveParent(fib5.parent);
                        }
                    });
                }
                return;
            }
            // Default: destroy parent visuals and move up
            this.destroyNodeVisuals(parent);
            const grandParent = parent.parent ? this.fibTree.get(parent.parent) : null;
            if (grandParent) {
                this.tweens.add({
                    targets: this.player,
                    x: grandParent.x,
                    y: grandParent.y - 50,
                    duration: 500,
                    onComplete: () => {
                        this.createRightSiblingAndChildren(parent.id);
                        this.revealCurrentPathAndStar();
                    }
                });
            } else {
                this.createRightSiblingAndChildren(parent.id);
                this.revealCurrentPathAndStar();
            }
        }
    }

    // --- Leftmost Path Construction for Right Subtree ---
    private createLeftmostPath(nodeId: string) {
        const node = this.fibTree.get(nodeId);
        if (!node) return;
        const children = this.getChildren(nodeId);
        if (children.length > 0) {
            // Always create the leftmost child first
            const leftChildId = children[0];
            const leftChild = this.fibTree.get(leftChildId);
            if (leftChild && !leftChild.platform && !leftChild.visited) {
                leftChild.isAccessible = true;
                this.createPlatformForNode(leftChild);
                if (leftChild.platform && this.player) {
                    this.physics.add.collider(this.player, leftChild.platform);
                }
                // Recursively go down the leftmost path
                this.createLeftmostPath(leftChildId);
            }
        }
    }

    private getChildren(parentId: string): string[] {
        const children: string[] = [];
        this.fibTree.forEach(node => {
            if (node.parent === parentId) children.push(node.id);
        });
        return children.sort((a, b) => this.fibTree.get(a)!.x - this.fibTree.get(b)!.x);
    }

    // --- Call Stack UI ---
    private createCallStackUI() {
        for (let i = 0; i < 10; i++) {
            const txt = this.add.text(620, 100 + i * 25, '', {
                fontSize: '16px', color: '#fff', backgroundColor: '#1c1c3c', padding: { x: 5, y: 2 }
            });
            this.callStack.push(txt);
        }
    }

    private updateCallStack(text: string, index: number, color: string) {
        if (this.callStack[index]) {
            this.callStack[index].setText(text).setBackgroundColor(color);
        }
    }

    // --- Completion ---
    private showCompletion() {
        const root = this.fibTree.get('fib-5');
        if (root) {
            this.callStack[0].setText(`Final result: 5`);
            this.callStack[0].setBackgroundColor('#28a745').setColor('#ffffff');
            this.add.text(400, 40, `Fibonacci Complete! Final Value: 5`, {
                fontSize: '24px', color: '#28a745', fontStyle: 'bold'
            }).setOrigin(0.5);
            const score = 100;
            if ((this as any).onGameEnd && typeof (this as any).onGameEnd === 'function') {
                this.time.delayedCall(1500, () => {
                    (this as any).onGameEnd(score);
                });
            }
        }
    }

    // --- Update Loop ---
    update(time: number, delta: number) {
        if (!this.cursors || !this.player) return;
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-180);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(180);
        } else {
            this.player.setVelocityX(0);
        }
        if (this.cursors.up.isDown && body.blocked.down) {
            this.player.setVelocityY(-500);
        }
        // Out-of-bounds fall reset logic
        if (this.player.y > this.FALL_RESET_Y) {
            this.fallTimer += delta;
            if (this.fallTimer > this.FALL_RESET_TIME) {
                // Reset player to fib(5) position
                this.player.setPosition(this.startPosition.x, this.startPosition.y);
                this.player.setVelocity(0, 0);
                this.fallTimer = 0;
            }
        } else {
            this.fallTimer = 0;
        }
        const currentNode = this.getCurrentPlatformNode();
        if (currentNode) {
            const match = currentNode.label.match(/fib\((\d+)\)/);
            const depth = match ? parseInt(match[1], 10) : 0;
            this.callDepthText.setText(`Depth: ${depth}`);
            this.callStack.forEach((txt, i) => {
                if (i === 5 - depth) {
                    txt.setBackgroundColor('#d35400');
                } else {
                    txt.setBackgroundColor('#1c1c3c');
                }
            });
        }
    }

    private createPlatformForNode(node: FibNode) {
        // Assign a color index based on depth (from label)
        let colorIdx = 0;
        const match = node.label.match(/fib\((\d+)\)/);
        if (match) {
            const depth = parseInt(match[1], 10);
            // Map depth to color index (deeper = different color)
            colorIdx = (5 - depth) % 5;
            if (colorIdx < 0) colorIdx += 5;
        }
        const platformKey = `platform-colorful-${colorIdx}`;
        // Create platform
        const platform = this.physics.add.staticSprite(node.x, node.y, platformKey);
        platform.setDisplaySize(180, 24).refreshBody();
        node.platform = platform;
        // Add label and store reference for later removal
        const labelText = this.add.text(node.x, node.y - 25, node.label, { fontSize: '16px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        (node as any).labelText = labelText;
        // Add artifact (star) for leaf nodes, only if not already collected
        if (node.isLeaf && this.player && !node.visited && !node.artifact) {
            node.artifact = this.physics.add.staticSprite(node.x, node.y - 50, 'magic-star');
            this.physics.add.overlap(this.player, node.artifact, () => this.collectArtifact(node.id), undefined, this);
        }
    }

    private createRightSiblingAndChildren(currentId: string) {
        const current = this.fibTree.get(currentId);
        if (!current || !current.parent) return;
        const siblings = this.getChildren(current.parent);
        const index = siblings.indexOf(currentId);
        const rightSiblingId = siblings[index + 1];
        if (rightSiblingId) {
            const sibling = this.fibTree.get(rightSiblingId);
            if (sibling && !sibling.platform && !sibling.visited) {
                sibling.isAccessible = true;
                this.createPlatformForNode(sibling);
                if (sibling.platform && this.player) {
                    this.physics.add.collider(this.player, sibling.platform);
                }
                // --- NEW: If this is fib(3-right), create its left child and recursively its leftmost path ---
                if (sibling.id === 'fib-3-right') {
                    this.createLeftmostPath(sibling.id);
                } else {
                    // Default: create all children of the right sibling
                    this.getChildren(sibling.id).forEach(cid => {
                        const child = this.fibTree.get(cid);
                        if (child && !child.platform && !child.visited) {
                            child.isAccessible = true;
                            this.createPlatformForNode(child);
                            if (child.platform && this.player) {
                                this.physics.add.collider(this.player, child.platform);
                            }
                        }
                    });
                }
            }
        }
        if (current.parent) this.tryResolveParent(current.parent);
    }

    private getCurrentPlatformNode(): FibNode | undefined {
        for (const node of Array.from(this.fibTree.values())) {
            if (node.platform && !node.visited) {
                const px = this.player.x;
                const py = this.player.y + this.player.displayHeight / 2;
                const left = node.x - 90;
                const right = node.x + 90;
                const top = node.y - 12;
                const bottom = node.y + 12;
                if (px > left && px < right && py > top && py < bottom) {
                    return node;
                }
            }
        }
        return undefined;
    }
}

// --- Helper: Draw a star using Phaser's Graphics API ---
function drawStar(graphics: Phaser.GameObjects.Graphics, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;
    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        graphics.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        graphics.lineTo(x, y);
        rot += step;
    }
    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
    graphics.fillPath();
} 