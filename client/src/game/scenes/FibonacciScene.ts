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
    thorns?: Phaser.GameObjects.Group;
    artifact?: Phaser.GameObjects.Sprite;
    value: number;
}

export class FibonacciScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private callStack: Phaser.GameObjects.Text[] = [];
    private callDepthText!: Phaser.GameObjects.Text;
    private startPosition = { x: 400, y: 50 };
    private fibTree: Map<string, FibNode> = new Map();
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private collectedLeaves = 0;
    private totalLeaves = 0;
    private completed = false;

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

        // Data setup
        this.initializeFibTree();
        this.createTextures();
        this.createPlatformsAndObjects();
        this.createPlayer();
        this.createCallStackUI();

        this.cursors = this.input.keyboard!.createCursorKeys();

        // Camera follow and bounds
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, 800, 700);

        // Count total leaves
        this.totalLeaves = Array.from(this.fibTree.values()).filter(n => n.isLeaf).length;

        // Initial call stack text
        this.updateCallStack(`Calling fib(5)...`, 0, '#d35400');
        this.callDepthText = this.add.text(20, 20, 'Depth: 5', { fontSize: '20px', color: '#fff' });
    }

    // --- Data Initialization ---
    private initializeFibTree() {
        // Hardcoded for fib(5) tree
        this.fibTree.set('fib-5', { id: 'fib-5', label: 'fib(5)', x: 400, y: 100, isLeaf: false, isAccessible: true, parent: null, visited: false, resolved: false, value: -1 });
        this.fibTree.set('fib-4', { id: 'fib-4', label: 'fib(4)', x: 250, y: 220, isLeaf: false, isAccessible: true, parent: 'fib-5', visited: false, resolved: false, value: -1 });
        this.fibTree.set('fib-3-right', { id: 'fib-3-right', label: 'fib(3)', x: 550, y: 220, isLeaf: false, isAccessible: false, parent: 'fib-5', visited: false, resolved: false, value: -1 });
        this.fibTree.set('fib-3-left', { id: 'fib-3-left', label: 'fib(3)', x: 150, y: 340, isLeaf: false, isAccessible: true, parent: 'fib-4', visited: false, resolved: false, value: -1 });
        this.fibTree.set('fib-2-right', { id: 'fib-2-right', label: 'fib(2)', x: 350, y: 340, isLeaf: false, isAccessible: false, parent: 'fib-4', visited: false, resolved: false, value: -1 });
        this.fibTree.set('fib-2-left', { id: 'fib-2-left', label: 'fib(2)', x: 50, y: 460, isLeaf: false, isAccessible: true, parent: 'fib-3-left', visited: false, resolved: false, value: -1 });
        this.fibTree.set('fib-1-right', { id: 'fib-1-right', label: 'fib(1)', x: 250, y: 460, isLeaf: true, isAccessible: false, parent: 'fib-3-left', visited: false, resolved: false, value: 1 });
        this.fibTree.set('fib-1-leaf', { id: 'fib-1-leaf', label: 'fib(1)', x: -50, y: 580, isLeaf: true, isAccessible: true, parent: 'fib-2-left', visited: false, resolved: false, value: 1 });
        this.fibTree.set('fib-0-leaf', { id: 'fib-0-leaf', label: 'fib(0)', x: 150, y: 580, isLeaf: true, isAccessible: false, parent: 'fib-2-left', visited: false, resolved: false, value: 0 });
    }

    // --- Texture Generation ---
    private createTextures() {
        this.createThornTexture();
        this.createStarTexture();
        this.createPlatformTexture();
    }

    private createPlatformTexture() {
        if (!this.textures.exists('platform-blue')) {
            const g = this.add.graphics();
            g.fillStyle(0x3a86ff, 1);
            g.fillRect(0, 0, 180, 24);
            g.lineStyle(4, 0xffffff, 0.3);
            g.strokeRect(0, 0, 180, 24);
            for (let s = 0; s < 5; s++) {
                g.fillStyle(0xffffff, 0.5);
                g.fillCircle(20 + s * 32, 8 + Math.random() * 8, 2 + Math.random() * 2);
            }
            g.generateTexture('platform-blue', 180, 24);
            g.destroy();
        }
    }

    private createThornTexture() {
        if (this.textures.exists('thorn')) return;
        const g = this.add.graphics();
        g.fillStyle(0xffffff, 1);
        g.fillTriangle(0, 15, 7.5, 0, 15, 15);
        g.generateTexture('thorn', 15, 15);
        g.destroy();
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
        this.walls = this.physics.add.staticGroup();
        this.fibTree.forEach(node => {
            // Platform
            const platform = this.physics.add.image(node.x, node.y, 'platform-blue').setImmovable(true);
            platform.setDisplaySize(180, 24).refreshBody();
            node.platform = platform;
            this.add.text(node.x, node.y - 25, node.label, { fontSize: '16px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);

            // Add invisible walls for leftmost/rightmost nodes
            if (node.x < 100) {
                this.walls.create(node.x - 90, node.y, undefined).setDisplaySize(10, 64).setVisible(false).refreshBody();
            }
            if (node.x > 700) {
                this.walls.create(node.x + 90, node.y, undefined).setDisplaySize(10, 64).setVisible(false).refreshBody();
            }

            // Artifacts (stars) for leaves
            if (node.isLeaf) {
                node.artifact = this.physics.add.sprite(node.x, node.y - 50, 'magic-star').setImmovable(true);
                this.physics.add.overlap(this.player, node.artifact, () => this.collectArtifact(node.id), undefined, this);
            }
            this.updateNodeAccessibility(node.id);
        });
        this.physics.add.collider(this.player, Array.from(this.fibTree.values()).map(node => node.platform!));
        this.physics.add.collider(this.player, this.walls);
    }

    // --- Accessibility & Thorns ---
    private updateNodeAccessibility(nodeId: string) {
        const node = this.fibTree.get(nodeId);
        if (!node || !node.platform) return;
        if (node.isAccessible) {
            node.platform.setTint(0xffffff);
            if (node.thorns) node.thorns.clear(true, true);
        } else {
            node.platform.setTint(0x666666);
            if (!node.isLeaf) {
                if (!node.thorns) node.thorns = this.add.group();
                for (let i = 0; i < 5; i++) {
                    const thornX = node.x - 60 + i * 30;
                    const thorn = this.physics.add.sprite(thornX, node.y - 15, 'thorn').setImmovable(true);
                    node.thorns.add(thorn);
                    this.physics.add.overlap(this.player, thorn, this.hitThorns, undefined, this);
                }
            }
        }
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
    }

    // --- Artifact Collection & Progression ---
    private collectArtifact(nodeId: string) {
        const node = this.fibTree.get(nodeId);
        if (!node || !node.artifact || node.visited) return;
        node.visited = true;
        node.artifact.destroy();
        this.collectedLeaves++;
        this.updateCallStack(`${node.label} returns ${node.value}`, 4, '#28a745');
        this.checkAndResolveParent(node.parent!);
        if (this.collectedLeaves === this.totalLeaves && !this.completed) {
            this.completed = true;
            this.showCompletion();
        }
    }

    private checkAndResolveParent(parentId: string | null) {
        if (!parentId) return;
        const parent = this.fibTree.get(parentId);
        if (!parent) return;
        const children = this.getChildren(parentId);
        const allChildrenVisited = children.every(childId => this.fibTree.get(childId)?.visited);
        if (allChildrenVisited) {
            parent.visited = true;
            parent.value = children.reduce((sum, childId) => sum + (this.fibTree.get(childId)?.value ?? 0), 0);
            this.updateCallStack(`${parent.label} returns ${parent.value}`, 3, '#1f618d');
            this.tweens.add({
                targets: this.player,
                x: parent.x,
                y: parent.y - 50,
                duration: 500,
                ease: 'Sine.InOut',
                onComplete: () => {
                    if (parent.parent) this.checkAndResolveParent(parent.parent);
                    this.makeSiblingAccessible(parentId);
                }
            });
        }
    }

    private makeSiblingAccessible(nodeId: string) {
        const node = this.fibTree.get(nodeId);
        const parent = this.fibTree.get(node?.parent!);
        if (!node || !parent) return;
        const children = this.getChildren(parent.id);
        const rightSiblingId = children[1];
        if (rightSiblingId && children[0] === nodeId) {
            const rightSibling = this.fibTree.get(rightSiblingId);
            if (rightSibling) {
                rightSibling.isAccessible = true;
                this.updateNodeAccessibility(rightSiblingId);
                this.getChildren(rightSiblingId).forEach(childId => {
                    this.fibTree.get(childId)!.isAccessible = true;
                    this.updateNodeAccessibility(childId);
                });
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

    private hitThorns = () => {
        this.player.setPosition(this.startPosition.x, this.startPosition.y);
        this.cameras.main.flash(200, 255, 0, 0);
    };

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
            this.callStack[0].setText(`Final result: ${root.value}`);
            this.callStack[0].setBackgroundColor('#28a745').setColor('#ffffff');
            this.add.text(400, 40, `Fibonacci Complete! Final Value: ${root.value}`, {
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
    update() {
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
        if (this.player.x < 80) this.player.x = 80;
        if (this.player.x > 720) this.player.x = 720;
        const depth = Math.max(0, 5 - Math.floor((this.player.y - 100) / 120));
        this.callDepthText.setText(`Depth: ${depth}`);
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