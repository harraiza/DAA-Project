import Phaser from 'phaser';

export class FactorialScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private callStack: Phaser.GameObjects.Text[] = [];
  private artifact!: Phaser.GameObjects.Sprite;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private returnValues: number[] = [];

  private baseY = 50;
  private levels = 5;
  private currentDepth = 0;
  private collected = false;
  private callDepthText!: Phaser.GameObjects.Text;
  private gameCompleted = false;

  private fallTimer: number = 0;
  private readonly FALL_RESET_Y = 1000;
  private readonly FALL_RESET_TIME = 2000; // ms

  constructor() {
    super('FactorialScene');
  }

  preload() {
    // Assets are pre-loaded via graphics, so no external files needed
  }

  create() {
    // Reset game state
    this.collected = false;
    this.gameCompleted = false;
    this.currentDepth = 0;
    this.returnValues = [];
    this.callStack = [];

    // Set world bounds larger than camera, and allow movement left of x=0
    this.physics.world.setBounds(-200, 0, 1400, 1200);

    this.lights.enable().setAmbientColor(0x333333);
    this.cameras.main.setBackgroundColor('#0f0f2d');

    this.createPlatforms();
    this.createPlayer();
    this.createArtifact();
    this.createCallStack();

    // **UPDATED**: Initialize the first call stack item on game start
    this.callStack[0].setText(`Calling factorial(5)...`);
    this.callStack[0].setBackgroundColor('#d35400');

    this.cursors = this.input.keyboard!.createCursorKeys();

    // Initial depth text, will be updated dynamically
    this.callDepthText = this.add.text(20, 20, 'Depth: 5', { fontSize: '20px', color: '#fff' });

    // Camera follows player and fits the scene
    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setBounds(0, 0, 800, this.baseY + this.levels * 120 + 200);
  }

  private createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    this.walls = this.physics.add.staticGroup();
    const platformColors = [0x3a86ff, 0x8338ec, 0xff006e, 0xfb5607, 0xffbe0b];
    for (let i = 0; i < this.levels; i++) {
      const y = this.baseY + 50 + i * 120;
      const x = (i % 2 === 0) ? 200 : 500;
      
      const key = `magic-platform-${i}`;
      if (!this.textures.exists(key)) {
        const g = this.add.graphics();
        const color = platformColors[i % platformColors.length];
        g.fillStyle(color, 1);
        g.fillRect(0, 0, 300, 32);
        g.lineStyle(6, 0xffffff, 0.3);
        g.strokeRect(0, 0, 300, 32);
        for (let s = 0; s < 8; s++) {
          g.fillStyle(0xffffff, 0.5);
          g.fillCircle(20 + s * 35, 8 + Math.random() * 16, 2 + Math.random() * 2);
        }
        g.generateTexture(key, 300, 32);
        g.destroy();
      }
      const platform = this.platforms.create(x, y, key) as Phaser.Physics.Arcade.Image;
      platform.setDisplaySize(300, 32).refreshBody();

      const label = (this.levels - i).toString();
      this.add.text(x, y - 25, `factorial(${label})`, { 
        fontSize: '18px', 
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      if (x === 200) {
        this.walls.create(x - 150, y - 16, undefined).setDisplaySize(10, 64).setVisible(false).refreshBody();
      }
      if (x === 500 && i !== this.levels - 1) {
        this.walls.create(x + 150, y - 16, undefined).setDisplaySize(10, 64).setVisible(false).refreshBody();
      }
      if (i === this.levels - 1) {
        this.walls.create(x + 150, y - 16, undefined).setDisplaySize(10, 64).setVisible(false).refreshBody();
      }
    }
  }

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
    this.player = this.physics.add.sprite(300, this.baseY - 50, 'magic-orb');
    this.player.setDisplaySize(40, 40);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.setPipeline('Light2D');
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.walls);
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
    // Disable collision with world bounds to remove bottom phantom wall
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(false);
  }

  private createArtifact() {
    const lastPlatformY = this.baseY + (this.levels - 1) * 120;
    const lastPlatformX = (this.levels - 1) % 2 === 0 ? 200 : 500;
    
    const key = 'magic-collectable';
    if (!this.textures.exists(key)) {
      const g = this.add.graphics();
      g.fillStyle(0xffe066, 1);
      g.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = Phaser.Math.DegToRad(72 * i - 90);
        const x = 32 + Math.cos(angle) * 28;
        const y = 32 + Math.sin(angle) * 28;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        const innerAngle = Phaser.Math.DegToRad(72 * i - 90 + 36);
        g.lineTo(32 + Math.cos(innerAngle) * 12, 32 + Math.sin(innerAngle) * 12);
      }
      g.closePath();
      g.fillPath();
      g.lineStyle(3, 0xffffff, 1);
      g.strokePath();
      g.generateTexture(key, 64, 64);
      g.destroy();
    }
    this.artifact = this.add.sprite(lastPlatformX, lastPlatformY - 40, key).setDisplaySize(40, 40).setVisible(true);
    this.physics.add.existing(this.artifact, true);
    this.physics.add.overlap(this.player, this.artifact, this.collectArtifact, undefined, this);
  }

  private collectArtifact = () => {
    if (!this.collected) {
      this.collected = true;
      this.artifact.destroy(); 
      
      this.callStack[this.currentDepth].setText(`factorial(1) -> returns 1`);
      // **NEW**: Store the base case return value
      this.returnValues[this.currentDepth] = 1;
      
      this.time.delayedCall(1000, () => this.ascend(this.currentDepth - 1));
    }
  };

  private createCallStack() {
    const x = 650;
    const yStart = 100;
    for (let i = 0; i < this.levels; i++) {
      const txt = this.add.text(x, yStart + i * 25, '', {
        fontSize: '16px',
        color: '#dddddd',
        backgroundColor: '#1c1c3c',
        padding: { x: 6, y: 2 },
      });
      this.callStack.push(txt);
    }
  }

  private ascend(depth: number) {
    if (depth < 0) {
        // **UPDATED**: Show the final calculated value
        const finalResult = this.returnValues[0];
        this.callStack[0].setText(`Final result: ${finalResult}`);
        this.callStack[0].setBackgroundColor('#28a745').setColor('#ffffff');
        this.add.text(400, this.baseY - 20, `Recursion Complete! Final Value: ${finalResult}`, {
            fontSize: '24px', color: '#28a745', fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.gameCompleted = true;
        
        // --- SCORE CALCULATION AND CALLBACK ---
        // Simple score: 100 if completed, can be made more complex
        const score = 100;
        // Call the onGameEnd callback if provided (from React)
        if ((this as any).onGameEnd && typeof (this as any).onGameEnd === 'function') {
          // Delay to allow the player to see the completion message
          this.time.delayedCall(1500, () => {
            (this as any).onGameEnd(score);
          });
        }
        return;
    }

    const targetY = this.baseY + depth * 120 - 60;
    const targetX = (depth % 2 === 0) ? 200 : 500;

    this.tweens.add({
      targets: this.player,
      y: targetY,
      x: targetX,
      duration: 700,
      ease: 'Sine.InOut',
      onComplete: () => {
        // **UPDATED**: Show the explicit calculation and result
        const currentFactorialNum = this.levels - depth;
        const prevResult = this.returnValues[depth + 1];
        const newResult = currentFactorialNum * prevResult;
        this.returnValues[depth] = newResult;

        this.callStack[depth].setText(`f(${currentFactorialNum}) -> ${currentFactorialNum} * ${prevResult} = ${newResult}`);
        this.callStack[depth].setBackgroundColor('#1f618d');
        this.callStack[depth + 1].setBackgroundColor('#1c1c3c');
        
        this.time.delayedCall(1000, () => this.ascend(depth - 1));
      }
    });
  }

  update(time: number, delta: number) {
    if (!this.player || !this.cursors) {
        if(this.player) this.player.setVelocityX(0);
        return;
    };

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    
    // Allow movement even after completion
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
    
    // Only update depth and call stack if game is not completed
    if (!this.gameCompleted) {
      const newDepth = Math.floor((this.player.y - this.baseY + 60) / 120);
      if (newDepth !== this.currentDepth && newDepth < this.levels && newDepth >= 0) {
        this.currentDepth = newDepth;
        
        const currentFactorialNum = this.levels - this.currentDepth;
        this.callStack[this.currentDepth].setText(`Calling factorial(${currentFactorialNum})...`);
        this.callStack[this.currentDepth].setBackgroundColor('#d35400');
        
        if(this.currentDepth > 0) {
          this.callStack[this.currentDepth - 1].setBackgroundColor('#1c1c3c');
        }

        this.callDepthText.setText(`Depth: ${currentFactorialNum}`);
      }
    }

    // Out-of-bounds fall reset logic
    if (this.player.y > this.FALL_RESET_Y) {
      this.fallTimer += delta;
      if (this.fallTimer > this.FALL_RESET_TIME) {
        // Reset player to starting position
        this.player.setPosition(300, this.baseY - 50);
        this.player.setVelocity(0, 0);
        this.fallTimer = 0;
      }
    } else {
      this.fallTimer = 0;
    }
  }
}
 