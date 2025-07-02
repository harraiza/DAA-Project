import Phaser from 'phaser';

export class BubbleSortScene extends Phaser.Scene {
    private array: number[] = [5, 4, 3, 2, 1, 0];
    private boxSprites: Phaser.GameObjects.Container[] = [];
    private visibleWindow: [number, number] = [0, 1];
    private attempts: number = 3;
    private infoText!: Phaser.GameObjects.Text;
    private gameEnded: boolean = false;
    private score: number = 0;
    private callDepthText!: Phaser.GameObjects.Text;
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private levelData: any;

    constructor() {
        super('BubbleSortScene');
    }

    preload() {}

    create() {
        if ((this as any).levelData) {
            this.levelData = (this as any).levelData;
        }
        this.cameras.main.setBackgroundColor('#0f0f2d');
        this.lights.enable().setAmbientColor(0x333333);
        this.createArrayBoxes();
        this.createInfoText();
        this.callDepthText = this.add.text(20, 20, `Attempts left: ${this.attempts}`, { fontSize: '20px', color: '#fff' });
        this.input.keyboard!.on('keydown', this.handleKeyInput, this);
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.updateBoxes();
    }

    private createArrayBoxes() {
        const colors = [0x3a86ff, 0x8338ec, 0xff006e, 0xfb5607, 0xffbe0b, 0x43aa8b];
        const startX = 120;
        const y = 220;
        const boxWidth = 90;
        for (let i = 0; i < this.array.length; i++) {
            const g = this.add.graphics();
            g.fillStyle(colors[i % colors.length], 1);
            g.fillRect(0, 0, boxWidth, 90);
            g.lineStyle(4, 0xffffff, 0.3);
            g.strokeRect(0, 0, boxWidth, 90);
            for (let s = 0; s < 5; s++) {
                g.fillStyle(0xffffff, 0.5);
                g.fillCircle(15 + s * 15, 10 + Math.random() * 70, 2 + Math.random() * 2);
            }
            const numText = this.add.text(boxWidth / 2, 45, this.array[i].toString(), {
                fontSize: '36px',
                color: '#fff',
                fontStyle: 'bold',
                fontFamily: 'monospace',
                shadow: { color: '#000', blur: 4, fill: true }
            }).setOrigin(0.5);
            const container = this.add.container(startX + i * (boxWidth + 10), y, [g, numText]);
            container.setDepth(1);
            this.boxSprites.push(container);
        }
    }

    private createInfoText() {
        this.infoText = this.add.text(400, 350, `Attempts left: ${this.attempts}`, {
            fontSize: '22px',
            color: '#fff',
            fontStyle: 'bold',
            fontFamily: 'monospace',
            backgroundColor: '#222a',
            padding: { x: 10, y: 6 },
            shadow: { color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5).setDepth(2);
    }

    private handleKeyInput(event: KeyboardEvent) {
        if (this.gameEnded) return;
        const [i, j] = this.visibleWindow;
        if (event.key === 'ArrowRight') {
            if (j < this.array.length - 1) {
                this.visibleWindow = [i + 1, j + 1];
                this.updateBoxes();
            }
        } else if (event.key === 'ArrowLeft') {
            if (i > 0) {
                this.visibleWindow = [i - 1, j - 1];
                this.updateBoxes();
            }
        } else if (event.key.toLowerCase() === 's') {
            this.swapVisible();
        }
    }

    private swapVisible() {
        const [i, j] = this.visibleWindow;
        if (i < 0 || j >= this.array.length) return;
        const temp = this.array[i];
        this.array[i] = this.array[j];
        this.array[j] = temp;
        this.updateBoxes();
    }

    private updateBoxes() {
        for (let k = 0; k < this.boxSprites.length; k++) {
            const container = this.boxSprites[k];
            container.removeAll(true);
            const colors = [0x3a86ff, 0x8338ec, 0xff006e, 0xfb5607, 0xffbe0b, 0x43aa8b];
            const g = this.add.graphics();
            g.fillStyle(colors[k % colors.length], 1);
            g.fillRect(0, 0, 90, 90);
            g.lineStyle(4, 0xffffff, 0.3);
            g.strokeRect(0, 0, 90, 90);
            for (let s = 0; s < 5; s++) {
                g.fillStyle(0xffffff, 0.5);
                g.fillCircle(15 + s * 15, 10 + Math.random() * 70, 2 + Math.random() * 2);
            }
            if (k === this.visibleWindow[0] || k === this.visibleWindow[1]) {
                const numText = this.add.text(45, 45, this.array[k].toString(), {
                    fontSize: '36px',
                    color: '#fff',
                    fontStyle: 'bold',
                    fontFamily: 'monospace',
                    shadow: { color: '#000', blur: 4, fill: true }
                }).setOrigin(0.5);
                container.add([g, numText]);
                container.setAlpha(1);
            } else {
                g.fillStyle(0x111111, 0.85);
                g.fillRect(0, 0, 90, 90);
                container.add([g]);
                container.setAlpha(0.5);
            }
        }
    }

    private checkSorted() {
        if (this.isSorted(this.array)) {
            this.score = this.attempts * 33 + 1;
            this.showCompletion(true);
        } else {
            this.attempts--;
            if (this.attempts > 0) {
                this.infoText.setText(`Not sorted! Attempts left: ${this.attempts}`);
                this.callDepthText.setText(`Attempts left: ${this.attempts}`);
            } else {
                this.showCompletion(false);
            }
        }
    }

    private showCompletion(success: boolean) {
        this.gameEnded = true;
        if (success) {
            this.score = this.attempts * 33 + 1;
            const levelId = this.levelData?.id || 3;
            if ((this as any).onGameEnd) {
                (this as any).onGameEnd(this.score, levelId);
            }
        } else {
            this.infoText.setText('Game Over! Try again.');
            this.callDepthText.setText('Attempts left: 3');
            this.time.delayedCall(1000, () => {
                this.resetGame();
            });
        }
    }

    private resetGame() {
        this.array = [5, 4, 3, 2, 1, 0];
        this.attempts = 3;
        this.visibleWindow = [0, 1];
        this.gameEnded = false;
        this.infoText.setText(`Attempts left: ${this.attempts}`);
        this.callDepthText.setText(`Attempts left: ${this.attempts}`);
        this.updateBoxes();
    }

    private isSorted(arr: number[]) {
        for (let i = 1; i < arr.length; i++) {
            if (arr[i - 1] > arr[i]) return false;
        }
        return true;
    }

    update(time: number, delta: number) {
        if (!this.gameEnded && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.checkSorted();
        }
    }
}
