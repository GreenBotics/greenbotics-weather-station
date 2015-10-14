void setup() {
  pinMode(0, OUTPUT);
  Serial.begin(115200);

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
}
 
void loop() {
  digitalWrite(0, HIGH);
  delay(500);
  digitalWrite(0, LOW);
  delay(500);
  Serial.println("Testing");
}
