// Wait for all assets to load before executing code
window.addEventListener('load', function() {
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 700;
    canvas.height = 1244;
    
    const musicButton = this.document.getElementById('musicButton');
    const backgroundMusic = this.document.getElementById('backgroundMusic');
    const popSound = this.document.getElementById('popsound');
    const splashSound = this.document.getElementById('splashsound');
    const ringSound = this.document.getElementById('ring');

    allow_sound = false;
    musicButton.addEventListener('click', () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
            musicButton.textContent = '🔊';
            allow_sound = true;
        } 
        else {
            backgroundMusic.pause();
            musicButton.textContent = '🔇';
            allow_sound = false;
        }
    });

    // Restart sound if its ended
    backgroundMusic.addEventListener('ended', () => {
        if (allow_sound) { 
          backgroundMusic.currentTime = 0; 
          backgroundMusic.play(); 
        }
      });    

    function playPopSound() {
        if(allow_sound) {
            popSound.play();
        }
    }

    function playSplashSound() {
        if(allow_sound) {
            splashSound.play();
        }
    }

    function playRingSound() {
        if(allow_sound) {
            ringSound.play();
        }
    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = this.gameWidth;
            this.height = this.gameHeight;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
        }
    }

    class Water {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('water');
            this.x = 0;
            this.y = gameHeight - 200;
            this.width = 700;
            this.height = 300;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
        }
    }

    // Handle user input
    class InputHandler {
        constructor() {
            // This will hold whether the mouse is being held down and the coordinates
            this.mouseDown = null;
            this.mouseLocation = [0, 0];

            // Event listeners for mouse
            window.addEventListener('mousedown', (e) => {
                this.mouseDown = e.buttons;
            });
            window.addEventListener('mouseup', (e) => {
                this.mouseDown = e.buttons;
            });
            window.addEventListener('mousemove', (e) => {
                // Only update if the mouse is being held down
                const rect = canvas.getBoundingClientRect();
                this.mouseDown = e.buttons;
                this.mouseLocation[0] = e.clientX - rect.left;
                this.mouseLocation[1] = e.clientY - rect.top;
            });

            // Event listeners for touchscreen
            window.addEventListener('touchstart', (e) => {
                this.mouseDown = 1;
            });
            window.addEventListener('touchend', (e) => {
                this.mouseDown = 0;
            });
            window.addEventListener('touchmove', (e) => {
                const rect = canvas.getBoundingClientRect();

                // Get the location of the users finger and adjust the coordinates to match the canvas scaling
                this.mouseLocation[0] = (e.touches[0].pageX * (canvas.width/(rect.right - rect.left)) - rect.left * (canvas.height/(rect.bottom - rect.top)));
                this.mouseLocation[1] = (e.touches[0].pageY * (canvas.height/(rect.bottom - rect.top)) - rect.top * (canvas.height/(rect.bottom - rect.top)));    
            });
        }
    }

    // Defines the cup object
    class Cup {
        constructor(gameWidth, gameHeight, combination, imageId) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 196;
            this.height = 416;
            this.x = -200;
            this.y = 140;
            this.image = document.getElementById(imageId);
            this.combination = combination;
            this.number_of_pearls = 0;
            this.delete_pearls = false;
            this.flag1 = true;
            this.flag2 = true;
            this.flag3 = true;
        }

        draw(context) {
            context.fillstyle = 'white';
            context.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x, this.y, this.width, this.height);
        }

        draw_in() {
            if(this.x < this.gameWidth/2 - this.width/2) {
                this.x = this.x + 5;
            }

            if(this.flag1 && this.number_of_pearls == 1) {
                this.image = document.getElementById("cup1");
                playSplashSound();
                update_board();
                this.flag1 = false;
            }
            else if(this.flag2 && this.number_of_pearls == 2) {
                this.image = document.getElementById("cup2");
                playSplashSound();
                update_board();
                this.flag2 = false;
            }
            else if(this.flag3 && this.number_of_pearls == 3) {
                this.image = document.getElementById("cup3");
                playSplashSound();
                update_board();
                this.flag3 = false;
            }
        }

        draw_out() {
            if(this.number_of_pearls >= 3 && this.x < this.gameWidth) {
                this.x = this.x + 5;
                return false;
            }
            else if(this.x >= this.gameWidth) {
                playRingSound();
                return true;
            }
            else {
                return false;
            }
        }
    }

    // Defines the spoon object (used to scoop up pearls)
    class Spoon {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 300;
            this.height = 150;
            this.x = 40;
            this.y = 50;
            this.image = document.getElementById('spoon');
        }
        draw(context) {
            context.fillstyle = 'white';
            context.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x, this.y, this.width, this.height);
        }

        update(input) {
            this.x = input.mouseLocation[0] - this.width/2;
            this.y = input.mouseLocation[1] - this.height/2;  
        }
    }

    // Follows the spoon around
    class Spoon_hitbox {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 75;
            this.height = 75;
            this.x = -100;
            this.y = -100;
            this.image = document.getElementById('spoon_hitbox');
            this.occupied = 0;
        }
        draw(context) {
            context.fillstyle = 'white';
            context.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x, this.y, this.width, this.height);
        }

        update(spoon) {
            this.x = spoon.x;
            this.y = spoon.y + this.height;  
        }
    }

    // Order board
    class OrderBoard {
        constructor(gameWidth, gameHeight, imageId, y) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 60;
            this.height = 60;
            this.x = 40;
            this.y = y;
            this.image = document.getElementById(imageId);
        }

        draw(context) {
            context.fillstyle = 'white';
            context.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x, this.y, this.width, this.height);
        }

        update(imageId) {
            this.image = document.getElementById(imageId);
        }
    }


    // Defines a generic bubble object
    class Bubble {
        constructor(gameWidth, gameHeight, imageId, bubble_type) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 75;
            this.height = 75;
            this.x = this.gameWidth/2 - this.width/2;
            this.y = this.gameHeight/2;
            this.image = document.getElementById(imageId);
            this.bubble_type = bubble_type;
            this.bubble_state = 3;
            this.incup = false;
            this.inspoon = false;
        }
        draw(context) {
            context.fillstyle = 'white';
            context.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x, this.y, this.width, this.height);
        }
    }

    // Random number function
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Create a new cup with bubble options 1-4
    function create_cup(bubble_options) {
        combination = [getRandomInt(1,bubble_options), getRandomInt(1,bubble_options), getRandomInt(1,bubble_options)];
        cup = new Cup(canvas.width, canvas.height, combination, "cup0");
        return cup;
    }

    const input = new InputHandler();

    // [Blue, Orange, Pink, Purple]
    const full_bubbles = ["bubble_blue_full", "bubble_orange_full", "bubble_pink_full", "bubble_purple_full", "check"];
    const mushy_bubbles = ["bubble_blue_mushy", "bubble_orange_mushy", "bubble_pink_mushy", "bubble_purple_mushy"];
    const broken_bubbles = ["bubble_blue_broken", "bubble_orange_broken", "bubble_pink_broken", "bubble_purple_broken"];

    // Initialize and draw a spoon
    const spoon = new Spoon(canvas.width, canvas.height);
    const spoon_hitbox = new Spoon_hitbox(canvas.width, canvas.height);

    // Initialize background and water
    const background = new Background(canvas.width, canvas.height);
    const water = new Water(canvas.width, canvas.height);

    // Initialize the first cup
    cup_done = false;
    new_cup = create_cup(4);

    // Inititalize the order board
    const board1 = new OrderBoard(canvas.width, canvas.height, full_bubbles[new_cup.combination[0] - 1], 200);
    const board2 = new OrderBoard(canvas.width, canvas.height, full_bubbles[new_cup.combination[1] - 1], 275);
    const board3 = new OrderBoard(canvas.width, canvas.height, full_bubbles[new_cup.combination[2] - 1], 350);

    function update_board() {
        board1.update(full_bubbles[new_cup.combination[0] - 1]);
        board2.update(full_bubbles[new_cup.combination[1] - 1]);
        board3.update(full_bubbles[new_cup.combination[2] - 1]);  
    }

    function replace_cup() {
        new_cup = create_cup(4);

        // Update the board
        update_board();
    }

    // Create an array to hold all active bubbles
    bubble_array = []

    // Function called periodically to create new bubbles
    last_bubble = -1;
    function spawn_bubbles() {
        // Choose a random bubble but no repeats
        do {
            bubble_type = getRandomInt(0,3);
        }while(bubble_type == last_bubble)
        console.log("Last: ", last_bubble, " New: ", bubble_type);   
        last_bubble = bubble_type;

        bubble_array.push(new Bubble(canvas.width, canvas.height, full_bubbles[bubble_type], bubble_type));
    }

    function delete_bubbles() {
        if(bubble_array.length > 3) {
            // Choose a random bubble to decay
            this_bubble = bubble_array[getRandomInt(0, bubble_array.length - 1)]
            
            this_bubble.bubble_state--;
            
            if(this_bubble.bubble_state == 2) {
                // Make bubble mushy
                this_bubble.image = document.getElementById(mushy_bubbles[this_bubble.bubble_type]);
                this_bubble.height = this_bubble.height * 2/3;
            }
            else if(this_bubble.bubble_state == 1) {
                // Make bubble broken
                this_bubble.image = document.getElementById(broken_bubbles[this_bubble.bubble_type]);
            }
            else {
                // Delete bubble      
                const index = bubble_array.indexOf(this_bubble);
                spoon_hitbox.occupied = 0;
                if(index > -1) {
                    bubble_array.splice(index, 1);
                    playPopSound();
                }
            }
        }
    }

    const spawnInterval = this.setInterval(spawn_bubbles, 3000); //5000
    const decayInterval = this.setInterval(delete_bubbles, 1000); //2000

    // Initialize physics
    init_physics(canvas.width, canvas.height);

    // This function loops to handle animations
    function animate() {
        // Reset the canvas and draw new animations
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        water.draw(ctx);

        // Draw the board
        board1.draw(ctx);
        board2.draw(ctx);
        board3.draw(ctx);

        // Draw the cup
        cup.draw(ctx);
        cup.draw_in();
        cup_done = cup.draw_out();
        if(cup_done) {
            replace_cup();
        }

        // Draw the spoon
        spoon.draw(ctx);
        //spoon_hitbox.draw(ctx);

        spoon.update(input);
        spoon_hitbox.update(spoon);

        // Calculate physics
        physics_iterate(bubble_array, spoon_hitbox, cup);
        physics_draw(bubble_array, ctx);

        requestAnimationFrame(animate);
    }
    animate();
});