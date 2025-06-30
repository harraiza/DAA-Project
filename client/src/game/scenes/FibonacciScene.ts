import Phaser from 'phaser';

// Define the structure for each node in our Fibonacci tree
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
    value: number; // To store the calculated Fibonacci value
}

export class FibonacciScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private callStack: Phaser.GameObjects.Text[] = [];
    private startPosition = { x: 400, y: 50 };

    // Data structure representing the fib(5) tree
    private fibTree: Map<string, FibNode> = new Map();

    constructor() {
        super('FibonacciScene');
    }

    preload() {
        // All assets are generated with graphics, no external files needed.
    }

    create() {
        this.lights.enable().setAmbientColor(0x444444);
        this.cameras.main.setBackgroundColor('#2d0f0f');

        this.initializeFibTree();
        this.createPlatformsAndObjects();
        this.createPlayer();
        this.createCallStackUI();

        this.cursors = this.input.keyboard!.createCursorKeys();

        this.physics.add.collider(this.player, Array.from(this.fibTree.values()).map(node => node.platform!));
        
        // Set initial call stack text
        this.updateCallStack(`Calling fib(5)...`, 0, '#d35400');
    }

    // Setup the data for the fib(5) tree structure
    private initializeFibTree() {
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

    private createPlatformsAndObjects() {
        // Create textures if they don't exist
        this.createThornTexture();
        this.createStarTexture();

        this.fibTree.forEach(node => {
            // Create platform
            const platform = this.physics.add.image(node.x, node.y, 'platform-blue').setImmovable(true);
            platform.body.checkCollision.down = false;
            platform.body.checkCollision.left = false;
            platform.body.checkCollision.right = false;
            node.platform = platform;
            this.add.text(node.x, node.y - 25, node.label, { fontSize: '16px', color: '#fff' }).setOrigin(0.5);

            if (node.isLeaf) {
                // Place stars on leaf nodes
                node.artifact = this.physics.add.sprite(node.x, node.y - 50, 'magic-star').setImmovable(true);
                this.physics.add.overlap(this.player, node.artifact, () => this.collectArtifact(node.id), undefined, this);
            }

            // Set accessibility
            this.updateNodeAccessibility(node.id);
        });
    }
    
    // Update a node's visual state based on its accessibility
    private updateNodeAccessibility(nodeId: string) {
        const node = this.fibTree.get(nodeId);
        if (!node || !node.platform) return;

        if (node.isAccessible) {
            node.platform.setTint(0xffffff); // Normal color
            if (node.thorns) {
                node.thorns.clear(true, true);
            }
        } else {
            node.platform.setTint(0x666666); // Greyed out
            if (!node.isLeaf) {
                // Add thorns to inaccessible non-leaf nodes
                if (!node.thorns) {
                    node.thorns = this.add.group();
                }
                for (let i = 0; i < 5; i++) {
                    const thornX = node.x - 60 + i * 30;
                    const thorn = this.physics.add.sprite(thornX, node.y - 15, 'thorn').setImmovable(true);
                    node.thorns.add(thorn);
                    this.physics.add.overlap(this.player, thorn, this.hitThorns, undefined, this);
                }
            }
        }
    }

    private collectArtifact(nodeId: string) {
        const node = this.fibTree.get(nodeId);
        if (!node || !node.artifact || node.visited) return;

        node.visited = true;
        node.artifact.destroy();
        this.updateCallStack(`${node.label} returns ${node.value}`, 4, '#28a745');

        // Check if this collection resolves a parent
        this.checkAndResolveParent(node.parent!);
    }

    private checkAndResolveParent(parentId: string) {
        const parent = this.fibTree.get(parentId);
        if(!parent) return;

        const children = this.getChildren(parentId);
        const allChildrenVisited = children.every(childId => this.fibTree.get(childId)?.visited);

        if (allChildrenVisited) {
            parent.visited = true;
            parent.value = children.reduce((sum, childId) => sum + (this.fibTree.get(childId)?.value ?? 0), 0);
            
            this.updateCallStack(`${parent.label} returns ${parent.value}`, 3, '#1f618d');
            
            // Player visual feedback: move back to parent
            this.tweens.add({
                targets: this.player,
                x: parent.x,
                y: parent.y - 50,
                duration: 500,
                ease: 'Sine.InOut',
                onComplete: () => {
                    // After resolving a node, check if its parent can be resolved
                    if (parent.parent) {
                        this.checkAndResolveParent(parent.parent);
                    }
                    // Make sibling accessible
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
        if (rightSiblingId && children[0] === nodeId) { // If this was the left child
            const rightSibling = this.fibTree.get(rightSiblingId);
            if (rightSibling) {
                rightSibling.isAccessible = true;
                this.updateNodeAccessibility(rightSiblingId);
                // Make its children accessible too
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
            if (node.parent === parentId) {
                children.push(node.id);
            }
        });
        // A simple way to sort left and right children based on x position
        return children.sort((a, b) => this.fibTree.get(a)!.x - this.fibTree.get(b)!.x);
    }
    
    private hitThorns = () => {
        this.player.setPosition(this.startPosition.x, this.startPosition.y);
        this.cameras.main.flash(200, 255, 0, 0);
    };

    private createPlayer() {
        this.player = this.physics.add.sprite(this.startPosition.x, this.startPosition.y, 'magic-orb');
        this.player.setDisplaySize(40, 40).setCollideWorldBounds(true).setGravityY(500);
        this.lights.addLight(this.player.x, this.player.y, 150).setColor(0x66ccff).setIntensity(2);
    }

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

    update() {
        if (!this.cursors || !this.player) return;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body!.touching.down) {
            this.player.setVelocityY(-400);
        }
    }

    // --- Graphics Generation ---
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
}

// Helper function to draw a star using Phaser's Graphics API
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