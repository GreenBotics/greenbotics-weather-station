void myDelay(int ms) {
    int i;
    for(i=1;i!=ms;i++) {
      delay(1);
      if(i%100 == 0) {
        ESP.wdtFeed();
        yield();
      }
    }
}
