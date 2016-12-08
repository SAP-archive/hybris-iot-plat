$fn = 75;

board_diameter = 52.5;
board_height = 7.5;
wall_width = 1;
hook_diameter = 1;

mink = 1;

outer_diameter = board_diameter + wall_width;
outer_height = board_height + wall_width;


difference() {
    difference() {
        minkowski() {
            cylinder(h=outer_height-mink,d = outer_diameter-(2*mink));
            sphere(radius=mink);
        }
        
        
        translate([0,0,wall_width]) {
            minkowski() {
                cylinder(h=outer_height-mink,d = board_diameter-(2*mink));
                sphere(radius=mink);
            }
        }
        
    }
    
    //usb
    translate([20,0,(outer_height/2)+1]) {
        cube([20,9,outer_height], true);
    }    
}


//fixation right
rotate([0,0,10]) {
    for(i = [1:7]) {    
        rotate([0,0,i*20]) {
            translate([(board_diameter/2)-2.5,0,0]) {
                    cylinder(h=1,d = hook_diameter);
            }
        }
    }
}

rotate([0,0,-170]) {
    for(i = [1:7]) {    
        rotate([0,0,i*20]) {
            translate([(board_diameter/2)-2.5,0,0]) {
                    cylinder(h=1,d = hook_diameter);
            }
        }
    }
}



//top/lid
lid_inner_diameter = (board_diameter + wall_width + 0.2) - (2*mink);
lid_outer_diameter = lid_inner_diameter + wall_width;

through_hole_x_offset = 7;
through_hole_y_offset = -12;

! translate([60,0,0]) {
    difference() {
        difference() {
            minkowski() {
                cylinder(h=outer_height-mink,d = lid_outer_diameter);
                sphere(radius=mink);
            }
            
            
            translate([0,0,wall_width]) {
                minkowski() {
                    cylinder(h=outer_height-mink,d = lid_inner_diameter);
                    sphere(radius=mink);
                }
            }
            
        }
        
        //usb
        translate([20,0,(outer_height/2)+1]) {
            cube([20,9,outer_height], true);
        }    
        
        //through-hole for light sensor - CUTOUT
        translate([through_hole_x_offset,through_hole_y_offset,-wall_width])
            cylinder(h=board_height, r1=3, r2=3);
        
    }

    //through-hole for light sensor - WALLS
    translate([through_hole_x_offset,through_hole_y_offset,-1]){
        difference() {
            cylinder(h=board_height-1, r1=4, r2=2.5);
            cylinder(h=board_height-1, r1=3 , r2=2);
        }
        
        
    }
}
