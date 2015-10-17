const char* getUserInput(bool &flag){
  String content = "";
  char character;
  
  while(Serial.available() && !flag) {
    character = Serial.read();
    if(character == '\n'){
      flag = true;
      return content.c_str();
    }else{
      content.concat(character);
    }
  }
  
 }
 

