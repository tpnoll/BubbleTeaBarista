// Random number function
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Distance function
function calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
  
    // Using the Pythagorean theorem
    const distance = Math.sqrt(dx * dx + dy * dy);
  
    return distance;
}

// Draw all of the physics objects
function physics_draw(object_array, ctx) {
    for(const object of object_array) {
        object.draw(ctx);
    }
}

function apply_gravity(object) {
    if(object.y < canvas_height - object.height) {
        object.y = object.y + 10;  
    }
}

// Return if a bubble is touching the spoon hitbox
function check_spoon(object, spoon) {
    hitbox_leniance = 30;

    spoonx = spoon.x + spoon.width/2;
    spoony = spoon.y + spoon.height/2;
    objectx = object.x + object.width/2;
    objecty = object.y + object.height/2;

    if(spoon.occupied == 0 && (object.incup == false && (Math.abs(spoonx - objectx) < hitbox_leniance && Math.abs(spoony - objecty) < hitbox_leniance))) {
        return true;
    }
    else if(spoon.occupied == object && (object.incup == false && (Math.abs(spoonx - objectx) < hitbox_leniance && Math.abs(spoony - objecty) < hitbox_leniance))) {
        return true;
    }
    else {
        if(spoon.occupied != object && spoon.occupied != 0) {
            spoon.occupied = spoon.occupied;
        }
        else {
            spoon.occupied = 0;
        }
        return false;
    }
}

// Allow bubbles to be scooped up by the spoon
function handle_spoon(object, spoon) { 
    // First we want to check if a bubble is touching the spoon
    if(check_spoon(object, spoon)) {
        object.inspoon = true;
        spoon.occupied = object;
        object.x = spoon.x;
        object.y = spoon.y;
    }
}

// Prevent bubbles from going out of bounds
function enforce_bounds(object) {
    if(object.x < 0) {
        object.x = 0;
    }
    else if(object.x + object.width > canvas_width) {
        object.x = canvas_width - object.width;
    }
    if(object.y < 300) {
        object.y = 300;
    }
    else if(object.y + object.height > canvas_height - 100) {
        object.y = canvas_height - object.height - 100;
    }          
}

canvas_width = null;
canvas_height = null;

// Checks if a bubble should be in the cup
function check_incup(object, cup, object_array, spoon) {
   
    // In order to go in the cup the bubble must be in the spoon, above 300, and part of the order
    if((object.inspoon && object.y < 300) && cup.combination.includes(object.bubble_type + 1)) {
        
        // Remove the bubble from the cup combination
        const comb_index = cup.combination.indexOf(object.bubble_type + 1);
        if(comb_index > -1) {
            //cup.combination.splice(comb_index, 1);
            cup.combination[comb_index] = 5;
        }

        object.incup = true;
        cup.number_of_pearls++;

        object.inspoon = false;
        spoon.occupied = 0;
        object.y = 100;
        object.x = canvas_width/2 - object.width/2;
        
        // Remove the object from the object array
        const index = object_array.indexOf(object);
        if(index > -1) {
            object_array.splice(index, 1);
        }
    }
}

// Instatiate physics
function init_physics(width, height) {
    canvas_width = width;
    canvas_height = height;
}

// This is the main function to handle all physics processes
function physics_iterate(object_array, spoon, cup) {

    // Object independent processes
    for(object of object_array) {
        check_incup(object, cup, object_array, spoon);
        enforce_bounds(object);
        apply_gravity(object);
        handle_spoon(object, spoon);
    }

    // Collision
    handle_collision(object_array);
}

// Check bubble collision
function check_bubble_collision(object1, object2) {
    return object1.width > calculateDistance(object1.x, object1.y, object2.x, object2.y);
}

// If two bubbles are colliding they must be seperated
function split_bubbles(object1, object2) {
    if(object1.x <= object2.x) {
        object1.x--;
        object2.x++;
    }
    else {
        object1.x++;
        object2.x--;  
    }
    if(object1.y <= object2.y) {
        object1.y = object1.y - 10;
        object2.y++;
    }
    else {
        object1.y++;
        object2.y = object2.y - 10;  
    }
}

// Assume we are only dealing with circles, all of equal size
function handle_collision(object_array) {
    // First iterate through every object
    for(let i = 0; i < object_array.length; i++) {
        // Then compare it to every object after i
        for(let j = i + 1; j < object_array.length; j++) {
            
            // Bubbles that are touching must be seperated
            if(check_bubble_collision(object_array[i], object_array[j])) {
                split_bubbles(object_array[i], object_array[j]);
            }
        }
    }
}