


long measureDistance(long ){
  long t = 0, h = 0, hp = 0;

  // Transmitting pulse
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
    
  // Waiting for pulse
  t = pulseIn(echo, HIGH);

  // Calculating distance 
  h = t / 58;
 
  h = h - 6;  // offset correction
  h = 50 - h;  // water height, 0 - 50 cm

  return h
}



  
