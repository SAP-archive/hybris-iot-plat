#include <Adafruit_NeoPixel.h>
#include <EEPROM.h>

#define NEO 17
#define READINGS 3
#define SENSOR_PIN A0 // use A5 for Adafruit Playground, A0 for Teensy

// 10|id|id|id|id|tr|tr|b|p
struct MetaData { 
  uint32_t ID;
  uint16_t THRESHOLD;
  uint8_t BRIGHTNESS;
  uint8_t PIXELS;
};

MetaData meta;

int lastReading = 0;
unsigned long blockedTill = millis();
unsigned long timestamp = millis();

enum LiftState{
    PRODUCT_LIFTED,
    PRODUCT_ON
};

LiftState liftState = PRODUCT_LIFTED;

Adafruit_NeoPixel strip;

uint32_t COLOR_ON = strip.Color(255,255,255);
uint32_t COLOR_OFF = strip.Color(0,0,0);

char msg[150];

void setup() {

  pinMode(13, OUTPUT);
 
  Serial.begin(115200);

  EEPROM.get(0, meta);
  strip = Adafruit_NeoPixel(meta.PIXELS, NEO, NEO_GRB + NEO_KHZ800);
  
  strip.setBrightness(meta.BRIGHTNESS);
  strip.show();
  strip.begin();
}

void loop() {
  
  if (Serial.available() > 0) {
    int mode = Serial.read();

    if (mode == 0)
    {
      char buf[3];
      Serial.readBytes(buf, 3);

      int r = buf[0];
      int g = buf[1];
      int b = buf[2];
      
      uint32_t c = strip.Color(r,g,b);
      platformColor(c);
    }
    else if (mode == 1)
    {
      char buf[3];
      Serial.readBytes(buf, 3);

      int r = buf[0];
      int g = buf[1];
      int b = buf[2];

      uint32_t c = strip.Color(r,g,b);
      platformSequenceColor(c);   
    }
    else if (mode == 2)
    {
      char buf[3];
      Serial.readBytes(buf, 3);

      int r = buf[0];
      int g = buf[1];
      int b = buf[2];

      uint32_t c = strip.Color(r,g,b);
      platformSequenceCleanupColor(c);
    }
    else if (mode == 3) //each pixel individually
    {
      char buf[72];
      Serial.readBytes(buf, 72);

      for (byte pos = 0; pos < 24; pos++)
      {
        byte rPos = (pos * 3) + 0;
        byte gPos = (pos * 3) + 1;
        byte bPos = (pos * 3) + 2;
        uint32_t c = strip.Color(buf[rPos],buf[gPos],buf[bPos]);
        strip.setPixelColor(pos, c);
      }
      strip.show();
    }
    else if (mode == 4)
    {
      int val = sensorReading();  
      sprintf(msg, "{\"plat\":%lu,\"event\":\"%s\",\"value\":%lu}", meta.ID, "readSensor", (uint32_t)val);          
      Serial.println(msg);
      Serial.flush();
    }   
    else if (mode == 5) //flash
    {
      char buf[4];
      Serial.readBytes(buf, 4);

      int r = buf[0];
      int g = buf[1];
      int b = buf[2];
      int duration = buf[3] * 10; //255*10ms max 
      
      uint32_t c = strip.Color(r,g,b);
      flash(c, duration);
    } 
    else if (mode == 6) //rotateColor
    {
      char buf[4];
      Serial.readBytes(buf, 4);

      int r = buf[0];
      int g = buf[1];
      int b = buf[2];
      int delayMS = buf[3];
      
      uint32_t c = strip.Color(r,g,b);
      rotateColor(c, delayMS);
    }
    else if (mode == 7) //fadePixels to color with delayMS
    {
      char buf[4];
      Serial.readBytes(buf, 4);

      int r = buf[0];
      int g = buf[1];
      int b = buf[2];
      int delayMS = buf[3];
      
      uint32_t c = strip.Color(r,g,b);
      fadePixels(c, delayMS);
    }
    else if (mode == 10) //eeprom update
    {
      uint32_t plat_old = meta.ID;

      Serial.readBytes((char*)&meta, sizeof(MetaData));
      EEPROM.put(0, meta);
       
      strip.setBrightness(meta.BRIGHTNESS);
      strip.show();
      
      sprintf(msg, "{\"plat\":%lu,\"plat_old\":%lu,\"event\":\"%s\",\"threshold\":%lu,\"brightness\":%lu,\"pixels\":%lu}", meta.ID, plat_old, "EEPROM_UPDATE", (uint32_t)meta.THRESHOLD, (uint32_t)meta.BRIGHTNESS, (uint32_t)meta.PIXELS); 
      Serial.println(msg);
      Serial.flush(); //Flush will drain the Serial buffer which is interrupt based - use it after each message written to Serial!
    }    
    else if (mode == 11) //eeprom read
    {
      MetaData newMeta;
      EEPROM.get(0, newMeta);
      
      sprintf(msg, "{\"plat\":%lu,\"event\":\"%s\",\"threshold\":%lu,\"id\":%lu,\"brightness\":%lu,\"pixels\":%lu}", meta.ID, "EEPROM_READ", (uint32_t)newMeta.THRESHOLD, newMeta.ID, (uint32_t)newMeta.BRIGHTNESS, (uint32_t)newMeta.PIXELS); 
      Serial.flush();
      Serial.println(msg);
      Serial.flush(); //Flush will drain the Serial buffer which is interrupt based - use it after each message written to Serial!
    } 
    else //unknown command. consume all pixels
    {
      while(Serial.available())
        Serial.read();     
    }
  }
     
  
  int reading = sensorReading();
  //Serial.println(reading);
  int diff = reading - lastReading;
  
  boolean blocked = (millis() < blockedTill);
  
  if (!blocked) {
    if (abs(diff) > (uint32_t)meta.THRESHOLD && diff < 0 && liftState == PRODUCT_LIFTED)
    {
      //platformColor(COLOR_ON);
      liftState = PRODUCT_ON;
      digitalWrite(13, HIGH);
      liftEvent();
    }
    else if (abs(diff) > (uint32_t)meta.THRESHOLD && diff > 0 && liftState == PRODUCT_ON)
    {
      //platformColor(COLOR_OFF);
      liftState = PRODUCT_LIFTED;
      digitalWrite(13, LOW);
      liftEvent();
    }    
  }
  
  lastReading = reading;
  
  delay(100); // delay in between reads for stability
}

void platformColor(uint32_t c)
{ 
   for (int i=0; i < strip.numPixels(); i++) {
        strip.setPixelColor(i, c);
   }
   strip.show();
   blockedTill = millis() + 150;
}

void platformSequenceColor(uint32_t c)
{ 
   for (int i=0; i < strip.numPixels(); i++) {
        strip.setPixelColor(i, c);
        strip.show();
        delay(15);
   }
    
   delay(100);     
   platformColor(COLOR_OFF);
   blockedTill = millis() + 150;
}

void platformSequenceCleanupColor(uint32_t c)
{ 
   for (int i=0; i < strip.numPixels(); i++) {
        strip.setPixelColor(i, c);
        strip.show();
        delay(15);
   }

   for (int i=0; i < strip.numPixels(); i++) {
        strip.setPixelColor(i, COLOR_OFF);
        strip.show();
        delay(15);
   }   
   
   blockedTill = millis() + 150;
}

void flash(uint32_t c, int duration) {
  unsigned long flashTill = millis() + duration;
  
  while(millis() < flashTill)
  {

    //on
    for (int i=0; i < strip.numPixels(); i++) {
        strip.setPixelColor(i, c);
    }
    strip.show();
    delay(random(50, 150));
    
    //off
    for (int i=0; i < strip.numPixels(); i++) {
        strip.setPixelColor(i, COLOR_OFF);
    }
    strip.show();
    delay(random(50, 150));   
 
  }

  blockedTill = millis() + 50; //just 50, should be enough as it is off before
}

void rotateColor(uint32_t c, int delayMS) {

    int pixels = strip.numPixels();
    int max = pixels * 3;
    
    for (int i=0; i < max; i++) {
        strip.setPixelColor(i % pixels, c);
        int before = ( i % pixels ) - 1;
        if (before < 0)
          before = pixels - 1;
        strip.setPixelColor(before, COLOR_OFF);
        strip.show();
        delay(delayMS);
    }

    strip.setPixelColor(pixels-1, COLOR_OFF);
    strip.show();

    blockedTill = millis() + 150;
}

void fadePixels(uint32_t c, int delayMS)
{
  uint8_t max = strip.numPixels();
  bool touched[max]; //==inits to false

  for (int i=0; i < max; i++) {
    touched[i] = false;
  }
  
  int counter = 0;
  
  while(counter < max)
  {
    uint8_t randomPixel = random(0,max);

    if (!touched[randomPixel])
    {
      touched[randomPixel] = true;
      counter++;
      strip.setPixelColor(randomPixel, c);
      strip.show();
      delay(delayMS);
    }
  }

  blockedTill = millis() + 150;
  
}

void liftEvent()
{
  char msg[100];
  if (liftState == PRODUCT_ON)
  {
    uint32_t duration = millis() - timestamp;
    sprintf(msg, "{\"plat\":%lu,\"event\":\"%s\",\"duration\":%lu}", meta.ID, "product_down", duration); 
    Serial.println(msg);
    Serial.flush(); //Flush will drain the Serial buffer which is interrupt based - use it after each message written to Serial!
  }
  else 
  {
    timestamp = millis();
    sprintf(msg, "{\"plat\":%lu,\"event\":\"%s\"}", meta.ID, "product_up"); 
    Serial.println(msg);
    Serial.flush(); //Flush will drain the Serial buffer which is interrupt based - use it after each message written to Serial!
  }
}

int sensorReading()
{
  int total = 0;
  for (int i = 0; i < READINGS; i++)
  {
    total = total + analogRead(SENSOR_PIN);
    delay(5);
  }
  return total/READINGS;
}

