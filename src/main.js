import Phaser from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'

const config = {
	type: Phaser.AUTO,
	width: '100%',
	height: '100%',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 600 }
		}
	},
	scene: [HelloWorldScene]
}

export default new Phaser.Game(config)
