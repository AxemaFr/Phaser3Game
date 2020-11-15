import Phaser from 'phaser'
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import Group = Phaser.Physics.Arcade.Group;
import Text = Phaser.GameObjects.Text;
import GameObjectWithDynamicBody = Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;

export default class HelloWorldScene extends Phaser.Scene
{
  private player: SpriteWithDynamicBody = null;
  private platforms: StaticGroup;
  private currentScale: number = null;
  private score: number = 0;
  private scoreText: Text;
  private bombs: Group = null;
  private stars: Group = null;
  private gameOver: boolean;
  
  constructor()
  {
    super('hello-world')
  }

  preload()
  {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude',
      'assets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  create()
  {
    // setting up bg-image
    const image = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'sky')
    const scaleX = this.cameras.main.width / image.width;
    const scaleY = this.cameras.main.height / image.height;
    this.currentScale = Math.max(scaleX, scaleY);
    image.setScale(this.currentScale).setScrollFactor(0);

    this.initPlatforms();
    this.initPlayer();
    this.initStars();
    this.initScore();
    this.initBombs();
  }

  update(time, delta) {
    super.update(time, delta);

    let cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown)
    {
      this.player.setVelocityX(-160 * this.currentScale);

      this.player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
      this.player.setVelocityX(160 * this.currentScale);

      this.player.anims.play('right', true);
    }
    else
    {
      this.player.setVelocityX(0);

      this.player.anims.play('turn');
    }

    if (cursors.up.isDown && this.player.body.touching.down)
    {
      this.player.setVelocityY(-360 * this.currentScale);
    }

    if (cursors.down.isDown && !this.player.body.touching.down)
    {
      this.player.setVelocityY(160 * this.currentScale);
    }
  }
  
  initPlayer() {
    this.player = this.physics.add.sprite(this.cameras.main.width * 0.05, this.cameras.main.height * 0.90, 'dude').setScale(this.currentScale);

    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [ { key: 'dude', frame: 4 } ],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.physics.add.collider(this.player, this.platforms);
  }
  
  initPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    const platformScale = this.currentScale;

    // bottom platform
    this.platforms.create( this.cameras.main.width * 0.1,  this.cameras.main.height, 'ground');
    this.platforms.create( this.cameras.main.width * 0.5,  this.cameras.main.height, 'ground');
    this.platforms.create( this.cameras.main.width * 0.8,  this.cameras.main.height, 'ground');

    // left-up platform
    this.platforms.create(this.cameras.main.width * 0.2,  this.cameras.main.height * 0.75, 'ground');

    // center platform
    this.platforms.create(this.cameras.main.width * 0.5, this.cameras.main.height * 0.5, 'ground');

    // right-up platform
    this.platforms.create(this.cameras.main.width * 0.75,  this.cameras.main.height * 0.25, 'ground');

    
    //(platform: Phaser.Physics.Arcade.Body) =>
    this.platforms.getChildren().forEach((platform: any) => platform.setScale(platformScale).refreshBody());
  }
  
  initStars() {
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12 * this.currentScale, y: 0, stepX: 70 * this.currentScale }
    });

    // GameObjectWithBody
    this.stars.children.iterate((child: any) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
  }
  
  initScore() {
    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
  }
  
  initBombs() {
    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);

    this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
  }

  collectStar(player, star) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText('score: ' + this.score);

    if (this.stars.countActive(true) === 0)
    {
      // GameObjectWithBody
      this.stars.children.iterate((child: any) => {

        child.enableBody(true, child.x, 0, true, true);

      });

      const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      const bomb: Phaser.Physics.Arcade.Body = this.bombs.create(x, 16, 'bomb');
      bomb.setBounce(1, 0.7);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    }
  }
  
  hitBomb(player) {
    this.physics.pause();

    player.setTint(0xff0000);
    
    this.gameOver = true;
  }
}
