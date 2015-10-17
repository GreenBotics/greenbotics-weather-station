
String getUserInput(bool &flag, const char* message){
  String content = "";
  char character;
 
  /*Serial.print("Please enter");
  Serial.print(message);*/
  
  while(Serial.available() && !flag) {
    character = Serial.read();
    if(character == '\n'){
      flag = true;
      
      return content;//.toCharArray();
    }else{
      content.concat(character);
    }
  }
  
 }
 

