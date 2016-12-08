$fn = 150;


//top

/*just for checking */
//translate([0,0,4.5])
//rotate([0,180,180])
/*just for checking */

union(){
    difference() {
        
       union(){
            cylinder(h=5,d = 90,center=true);
            translate([0, 43.5,2]) 
                cube([20.8,4,9.0], center=true);
            
        }
        
       translate([0,0,3.5]) {
            difference() {
                cylinder(h=10,d = 87, center = true);
                cylinder(h=10,d = 70.5, center = true);
            }

        }
        
        translate([0,0,-1])
            cylinder(h=3,d = 5.5,center=true);
        
        translate([1.55,0,1.5])
            cylinder(h=2,d = 2,center=true);
        
        translate([-1.55,0,1.5])
            cylinder(h=2,d = 2,center=true);
        
        translate([0,-21,0.5]) 
            cube([30,33,4], center=true);
        
        translate([0, 26.5,5.2]) 
            cube([18,36,6], center=true);
        
        translate([0, 45,6.8]) 
            cube([8,2,6], center=true);
        
    }
    rotate([0,0,45]) 
    translate([0,0,2.5]) {
        translate([30,0,0])
            cylinder(h=2.5,d = 2.5,center=true);
        translate([-30,0,0])
            cylinder(h=2.5,d = 2.5,center=true);
        translate([0,30,0])
            cylinder(h=2.5,d = 2.5,center=true);
        translate([0,-30,0])
            cylinder(h=2.5,d = 2.5,center=true);
    }
    
    translate([0, 8.5,3]) 
            cube([18,1,1], center=true);
    translate([9.5, 13,3]) 
            cube([1,10,1], center=true);
    translate([-9.5, 13,3]) 
        cube([1,10,1], center=true);
  
}


//bottom

translate([100,0,1.5])
{
            
    difference() {
        
        union(){
            translate([0, 0, -1]) 
                cylinder(h=6,d = 90,center=true);
            translate([0, -43.5,-3]) 
                cube([21,4,2], center=true);
        }
        
        translate([0,-42,0.5]) 
            cube([21,10,5], center=true);       

         
        translate([0,-7.5,0.5]) 
             cube([21,80,4], center=true);       
        
        translate([0,37,0.5]) 
            cube([11,11,4], center=true);
        
        translate([0,0,0.5]) 
            cylinder(h=4,d = 55,center=true);
        
        translate([0,-13.5,-2]) 
            cylinder(h=10,d = 3.8,center=true);
        
        rotate([0,0,45]) 
        {
            translate([30,0,1.25])
                cylinder(h=2.5,d = 3,center=true);
            translate([-30,0,1.25])
                cylinder(h=2.5,d = 3,center=true);
            translate([0,30,1.25])
                cylinder(h=2.5,d = 3,center=true);
            translate([0,-30,1.25])
                cylinder(h=2.5,d = 3,center=true);
        }        
    }

 
    
    
}