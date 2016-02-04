char* ssid = "${ssid}";
char* password = "${password}";

//static ip, if any
byte ip[] = {${ip}};
// the router's gateway address:
byte gateway[] = { ${gateway} };
// the subnet:
byte subnet[] = { ${subnet} };

// The port to listen for incoming TCP connections 
#define LISTEN_PORT  ${in_port}
