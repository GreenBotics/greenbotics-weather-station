float readDepth(int trigger, int echo){

  /*long duration, distance;
  digitalWrite(triggerPin, LOW);
  delayMicroseconds(2);

  digitalWrite(triggerPin, HIGH);
  delayMicroseconds(10);

  digitalWrite(triggerPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  distance = (duration/2) / 29.1;
  return distance;*/
  float distance;

   digitalWrite(trigger,LOW);
   delayMicroseconds(5);
   // Start Measurement
   digitalWrite(trigger,HIGH);
   delayMicroseconds(10);
   digitalWrite(trigger,LOW);
   // Acquire and convert to mtrs
   distance=pulseIn(echo,HIGH);
   distance=distance*0.0001657;
   // send result to UART
   //Serial.println(distance);
   //delay(50);
   return distance;
}
