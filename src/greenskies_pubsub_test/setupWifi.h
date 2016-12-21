bool setupWifi(){
 // Connect to WiFi
 /*WiFi.begin("kraftwerk_air", "e1r4u91f5z");
 //set static ip part
 //WiFi.config(ip, gateway, subnet);

 while (WiFi.status() != WL_CONNECTED) {
   delay(500);
   Serial.print(".");
 }
 //Serial.println("");
 Serial.println("WiFi connected");

 // Print the IP address
 Serial.println(WiFi.localIP());
 //Serial.print(":");
 //USE_SERIAL.print(LISTEN_PORT);*/


WiFi.begin(ssid, password);

   Serial.print("Connecting");
   while (WiFi.status() != WL_CONNECTED)
   {
     delay(500);
     Serial.print(".");
   }
   Serial.println();

   Serial.print("Connected, IP address: ");
   Serial.println(WiFi.localIP());



 return true;
}
