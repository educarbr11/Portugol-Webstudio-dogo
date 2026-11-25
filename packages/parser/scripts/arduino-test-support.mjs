import fs from "node:fs";
import path from "node:path";

export function writeArduinoStubs(directory) {
  fs.writeFileSync(
    path.join(directory, "Arduino.h"),
    `#pragma once
#include <stdint.h>
#include <math.h>
#include <vector>
#include <utility>
class String { public: String(const char* = "") {} };
class SerialClass { public: void begin(int) {} template <typename T> void print(T) {} void println() {} };
inline SerialClass Serial;
#define HIGH 1
#define LOW 0
#define OUTPUT 1
#define INPUT 0
#define INPUT_PULLUP 2
#define NUM_DIGITAL_PINS 40
#define A0 14
inline int mock_digital[40] = {};
inline int mock_analog[40] = {};
inline int mock_modes[40] = {};
inline unsigned long mock_pulse = 0;
inline unsigned long mock_timeout = 0;
inline unsigned long mock_delay = 0;
inline std::vector<std::pair<int, int>> mock_writes;
inline void pinMode(int pin, int mode) { mock_modes[pin] = mode; }
inline void digitalWrite(int pin, int value) { mock_digital[pin] = value; mock_writes.emplace_back(pin, value); }
inline int digitalRead(int pin) { return mock_digital[pin]; }
inline void analogWrite(int pin, int value) { mock_analog[pin] = value; }
inline int analogRead(int pin) { return mock_analog[pin]; }
inline uint16_t touchRead(uint8_t) { return 15; }
inline void delay(unsigned long ms) { mock_delay = ms; }
inline void delayMicroseconds(unsigned long) {}
inline unsigned long millis() { return 0; }
inline unsigned long micros() { return 0; }
inline void tone(int, unsigned int, unsigned long = 0) {}
inline void noTone(int) {}
inline unsigned long pulseIn(int, int, unsigned long timeout = 1000000) { mock_timeout = timeout; return mock_pulse; }
inline void shiftOut(int, int, int, uint8_t) {}
inline uint8_t shiftIn(int, int, int) { return 0; }
inline bool digitalPinIsValid(int pin) { return pin >= 0 && pin < 40 && pin != 20 && pin != 24; }
inline bool digitalPinCanOutput(int pin) { return digitalPinIsValid(pin) && pin < 34; }
`,
  );
  const servo = `#pragma once
#include <Arduino.h>
inline int mock_servo_constructions = 0;
inline int mock_servo_angle = -1;
class Servo {
  int pin = -1;
public:
  Servo() { ++mock_servo_constructions; }
  int attach(int value) { pin = value; return 1; }
  bool attached() { return pin >= 0; }
  void write(int value) { mock_servo_angle = value; }
  void detach() { pin = -1; }
};
`;
  for (const file of ["Servo.h", "ESP32Servo.h"]) fs.writeFileSync(path.join(directory, file), servo);
  fs.writeFileSync(
    path.join(directory, "DHT.h"),
    `#pragma once
#include <Arduino.h>
static const uint8_t DHT11 = 11;
static const uint8_t DHT22 = 22;
inline float mock_temperature = NAN;
inline float mock_humidity = NAN;
inline int mock_dht_constructions = 0;
inline int mock_dht_destructions = 0;
inline int mock_dht_begins = 0;
class DHT {
public:
  DHT(int, int) { ++mock_dht_constructions; }
  ~DHT() { ++mock_dht_destructions; }
  void begin() { ++mock_dht_begins; }
  float readTemperature() { return mock_temperature; }
  float readHumidity() { return mock_humidity; }
};
`,
  );
}
