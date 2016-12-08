#include <EEPROM.h>

struct MetaData { 
  uint32_t ID;    //long unsigned
  uint16_t THRESHOLD; // half unsigned
  uint8_t BRIGHTNESS; // half half unsigned
  uint8_t PIXELS;
};

char msg[150];

void setup() {
  Serial.begin(9600);
  while(!Serial) {}

  MetaData data {
    65534,
    50, 
    255,
    10    
  };

  EEPROM.put(0, data);

  Serial.println("PUT DONE");

  MetaData meta; 
  EEPROM.get(0, meta);

  Serial.println(meta.ID);
  Serial.println(meta.THRESHOLD);
  Serial.println(meta.BRIGHTNESS);
  Serial.println(meta.PIXELS);

  sprintf(msg, "{\"plat\":%lu,\"event\":\"%s\",\"threshold\":%hu,\"id\":%lu,\"brightness\":%hhu,\"pixels\":%hhu}", meta.ID, "EEPROM_READ", meta.THRESHOLD, meta.ID, meta.BRIGHTNESS, meta.PIXELS); 
  Serial.println(msg);  
  
  

}



void loop() {
  /* Empty loop */
}
