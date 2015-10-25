// Function takes a void pointer to data, and how much to write (no other way to know)
// Could also take a starting address, and return the size of the reach chunk, to be more generic
int EEPROM_write(int addr, void * data ) {
  byte datasize = strlen(data)
   EEPROM.write(addr++, datasize);
   for (int i=0; i<datasize; i++) {
      EEPROM.write(addr++, data[i]);
   }
}

char* EEEPROM_read(int addr){
  byte datasize = EEPROM.read(addr++);
  char stringToRead[0x20];          // allocate enough space for the string here!
  char * readLoc = stringToRead;
  for (int i=0;i<datasize; i++) {
      readLoc = EEPROM.read(addr++);
      readLoc++;
  } 
}


